/**
 * Host half of the searchable model picker.
 *
 * Provides two Package-private JSON RPC methods consumed by the Client half:
 *   - `models({ sessionId })`  -> { ok, current, routable, groups, failures, recents }
 *   - `select({ sessionId, provider, model, reasoningEffort? })` -> { ok, selected }
 *
 * It replicates the host's `session.models` / `session.selectModel` behaviour
 * using the public `llm`, `agents` and `agentDefaultModel` services, and
 * installs its per-agent selection listeners with `{ prepend: true }` so the
 * switch wins over the api-proxy's inner model-selection waterfall listeners.
 *
 * NOTE: this file is written in the "dynamic Cordis plugin" form (a function
 * returning `{ apply(ctx) }`). See ../README.md for how to adapt it into a
 * real @deepseek-ai/dsh host plugin package.
 */
export function createModelPickerHost() {
  return {
    apply(ctx) {
      const llm = ctx.get('llm')
      if (llm === undefined) return
      const agents = ctx.get('agents')
      if (agents === undefined) return
      const defaults = ctx.get('agentDefaultModel')

      const selections = new WeakMap()
      const recents = []
      const disposeAll = new Set()

      ctx.effect(() => () => {
        for (const dispose of disposeAll) {
          try { dispose() } catch (_e) {}
        }
        disposeAll.clear()
      })

      function currentDefault() {
        if (defaults === undefined) return undefined
        try { return defaults.currentSelection() } catch (_e) { return undefined }
      }

      function selectionFor(agent) {
        let entry = selections.get(agent)
        if (entry !== undefined) return entry

        let picked
        const selection = {
          get current() {
            if (picked !== undefined) return picked
            let logged
            try { logged = agent.session.requestHeader()?.config } catch (_e) { logged = undefined }
            if (logged !== undefined) {
              return {
                provider: logged.provider,
                model: logged.model,
                ...(logged.reasoningEffort === undefined ? {} : { reasoningEffort: logged.reasoningEffort }),
              }
            }
            const def = currentDefault()
            if (def !== undefined) {
              return {
                provider: def.provider,
                model: def.model,
                ...(def.reasoningEffort === undefined ? {} : { reasoningEffort: def.reasoningEffort }),
              }
            }
            return undefined
          },
          set current(next) { picked = next },
          assembled: undefined,
        }

        let disposeAssembly = () => {}
        let disposeRequest = () => {}
        try {
          disposeAssembly = agent.ctx.on('system-prompt/assemble', async (_assembly, _context, next) => {
            const selected = selection.current
            const assembled = await next()
            selection.assembled = selected
            if (selected === undefined) return assembled
            return {
              ...assembled,
              variables: {
                ...(assembled.variables || {}),
                provider: selected.provider,
                model: selected.model,
              },
            }
          }, { prepend: true })
          disposeRequest = agent.ctx.on('agent/request', async (_payload, next) => {
            const resolved = await next()
            const selected = selection.assembled
            if (selected === undefined) return resolved
            const { reasoningEffort: _inherited, ...withoutInherited } = resolved
            return {
              ...withoutInherited,
              provider: selected.provider,
              model: selected.model,
              ...(selected.reasoningEffort === undefined ? {} : { reasoningEffort: selected.reasoningEffort }),
            }
          }, { prepend: true })
        } catch (_e) {
          /* scoped listeners unavailable: selection stays readable, switch may not route */
        }

        entry = {
          selection,
          dispose() {
            disposeAssembly()
            disposeRequest()
          },
        }
        selections.set(agent, entry)
        disposeAll.add(() => entry.dispose())
        return entry
      }

      async function buildCatalog() {
        const providers = llm.listProviders()
        const results = await Promise.all(providers.map(async (provider) => {
          try {
            const models = await llm.listModels(provider.id)
            const entries = await Promise.all(models.map(async (model) => {
              let reasoning
              try {
                const resolved = await llm.resolveModelInfo(provider.id, model.id)
                if (resolved !== undefined && resolved.reasoning !== undefined) {
                  reasoning = {
                    efforts: resolved.reasoning.efforts.map((effort) => ({
                      id: effort.id,
                      name: effort.name,
                      ...(effort.description === undefined ? {} : { description: effort.description }),
                    })),
                    ...(resolved.reasoning.defaultEffort === undefined ? {} : { defaultEffort: resolved.reasoning.defaultEffort }),
                  }
                }
              } catch (_e) { /* keep model without reasoning */ }
              return {
                id: model.id,
                name: model.name,
                ...(model.description === undefined ? {} : { description: model.description }),
                ...(reasoning === undefined ? {} : { reasoning }),
              }
            }))
            return { kind: 'group', group: { id: provider.id, name: provider.name, models: entries } }
          } catch (error) {
            return { kind: 'failure', failure: { id: provider.id, name: provider.name, message: error instanceof Error ? error.message : String(error) } }
          }
        }))
        return {
          groups: results.filter((r) => r.kind === 'group').map((r) => r.group).filter((g) => g.models.length > 0),
          failures: results.filter((r) => r.kind === 'failure').map((r) => r.failure),
        }
      }

      function routeServed(provider) {
        try {
          return llm.listProviders().some((p) => p.id === provider)
        } catch (_e) { return true }
      }

      function providerNameOf(providerId) {
        try {
          const found = llm.listProviders().find((p) => p.id === providerId)
          return found !== undefined ? found.name : providerId
        } catch (_e) { return providerId }
      }

      harness.handle('models', async (args) => {
        const sessionId = args != null ? args.sessionId : undefined
        if (typeof sessionId !== 'string' || sessionId.length === 0) {
          return { ok: false, error: { code: 'bad-request', message: 'sessionId is required' } }
        }
        const agent = agents.get(sessionId)
        if (agent === undefined) {
          return { ok: false, error: { code: 'session-not-found', message: 'no live agent for this session' } }
        }
        const current = selectionFor(agent).selection.current
        const { groups, failures } = await buildCatalog()
        const routable = current !== undefined ? routeServed(current.provider) : true
        return {
          ok: true,
          current: current === undefined ? null : current,
          routable,
          groups,
          failures,
          recents: recents.slice(),
        }
      })

      harness.handle('select', async (args) => {
        const sessionId = args != null ? args.sessionId : undefined
        const provider = args != null ? args.provider : undefined
        const model = args != null ? args.model : undefined
        const reasoningEffort = args != null ? args.reasoningEffort : undefined
        if (typeof sessionId !== 'string' || typeof provider !== 'string' || typeof model !== 'string') {
          return { ok: false, error: { code: 'bad-request', message: 'sessionId, provider and model are required' } }
        }
        const agent = agents.get(sessionId)
        if (agent === undefined) {
          return { ok: false, error: { code: 'session-not-found', message: 'no live agent for this session' } }
        }
        try {
          const config = { provider, model }
          if (reasoningEffort !== undefined) config.reasoningEffort = reasoningEffort
          const resolved = await llm.resolveCallConfig(config)
          const selected = {
            provider: resolved.provider,
            model: resolved.model,
            ...(resolved.reasoningEffort === undefined ? {} : { reasoningEffort: resolved.reasoningEffort }),
          }
          selectionFor(agent).selection.current = selected

          let name = selected.model
          try {
            const info = await llm.resolveModelInfo(selected.provider, selected.model)
            if (info !== undefined && typeof info.name === 'string' && info.name.length > 0) name = info.name
          } catch (_e) {}

          const at = recents.findIndex((r) => r.provider === selected.provider && r.model === selected.model)
          if (at >= 0) recents.splice(at, 1)
          recents.unshift({ provider: selected.provider, model: selected.model, name, providerName: providerNameOf(selected.provider) })
          if (recents.length > 8) recents.length = 8

          if (defaults !== undefined) {
            try { await defaults.saveSelection(selected) } catch (_e) {}
          }

          return { ok: true, selected }
        } catch (error) {
          return { ok: false, error: { code: 'model-unavailable', message: error instanceof Error ? error.message : String(error) } }
        }
      })
    },
  }
}
