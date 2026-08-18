/**
 * Client half of the searchable model picker.
 *
 * Replaces the `conversation.input.model` composer seat (the control left of
 * the send button) with a picker that has:
 *   - a search box that filters models by name / provider,
 *   - a "最近使用" (recently used) section,
 *   - provider groups with collapsible headers,
 *   - a compact reasoning-effort chip row for the current model.
 *
 * Data and writes go through the Host half via `host.call('models'|'select')`.
 *
 * NOTE: written in the "dynamic Cordis plugin" form. See ../README.md.
 */
export function createModelPickerClient() {
  const CSS = `.ms-root{position:relative;min-width:0}
.ms-trigger{min-width:0;max-width:220px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}
.ms-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.ms-trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}
.ms-trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}
.ms-trigger-label{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}
.ms-trigger-effort{color:var(--dsw-alias-label-caption);flex:none}
.ms-chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s;font-size:10px;line-height:1}
.ms-chevron-open{transform:rotate(180deg)}
.ms-menu{z-index:20;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);width:min(320px,100vw - 32px);max-height:min(440px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:12px;flex-direction:column;padding:6px;display:flex;position:absolute;bottom:calc(100% + 8px);right:0;overflow:hidden}
.ms-search{margin:0 0 6px;padding:6px 10px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);border:1px solid var(--dsw-alias-border-inverted);border-radius:8px;outline:none}
.ms-search:focus{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}
.ms-groups{overflow:auto;min-height:0}
.ms-group{border-top:1px solid var(--dsw-alias-border-inverted);padding-top:2px;margin-top:2px}
.ms-group:first-child{border-top:none;margin-top:0}
.ms-group-title{width:100%;display:flex;align-items:center;gap:6px;padding:5px 8px;font-size:11px;font-weight:600;letter-spacing:.02em;color:var(--dsw-alias-label-tertiary);background:0 0;border:none;cursor:pointer;border-radius:6px;text-align:left}
.ms-group-title:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ms-group-title-label{flex:1;min-width:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}
.ms-group-count{color:var(--dsw-alias-label-caption)}
.ms-option{width:100%;display:flex;align-items:center;gap:8px;padding:6px 8px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);background:0 0;border:none;border-radius:8px;cursor:pointer;text-align:left}
.ms-option:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.ms-option:disabled{cursor:default;opacity:.6}
.ms-option-selected{background:var(--dsw-alias-interactive-bg-hover)}
.ms-option-copy{flex:1;min-width:0;display:flex;flex-direction:column}
.ms-option-name{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}
.ms-option-desc{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}
.ms-check{color:var(--dsw-alias-label-secondary);flex:none}
.ms-section{margin-bottom:4px}
.ms-section-title{padding:4px 8px;font-size:11px;font-weight:600;letter-spacing:.02em;color:var(--dsw-alias-label-tertiary)}
.ms-efforts{display:flex;flex-wrap:wrap;gap:4px;padding:4px 0 2px}
.ms-effort{font-size:12px;line-height:18px;padding:2px 8px;border-radius:12px;border:1px solid var(--dsw-alias-border-inverted);background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer}
.ms-effort:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.ms-effort-active{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.ms-status,.ms-empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}
.ms-error{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;padding:7px 8px;font-size:12px;line-height:18px;margin-bottom:6px}
.ms-warning{color:var(--dsw-alias-state-warn-label);font-size:12px;line-height:18px;padding:4px 8px}`;

  function ModelSelect(props) {
    const locked = !!props.locked
    const sessionId = props.sessionId

    const [catalog, setCatalog] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [collapsed, setCollapsed] = React.useState({})
    const [busy, setBusy] = React.useState(false)
    const [actionError, setActionError] = React.useState(null)

    function load() {
      if (typeof sessionId !== 'string' || sessionId.length === 0) return
      setLoading(true)
      setError(null)
      host.call('models', { sessionId: sessionId }).then(
        (res) => {
          if (res && res.ok) setCatalog(res)
          else setError(res && res.error ? (res.error.message || res.error.code) : '加载失败')
          setLoading(false)
        },
        (e) => {
          setError(String((e && e.message) || e))
          setLoading(false)
        },
      )
    }

    React.useEffect(() => { load() }, [sessionId])

    function openMenu() {
      setOpen(true)
      setQuery('')
      setActionError(null)
      load()
    }
    function closeMenu() {
      setOpen(false)
      setQuery('')
    }

    function doSelect(provider, model, effort) {
      if (busy) return
      setBusy(true)
      setActionError(null)
      const payload = { sessionId: sessionId, provider: provider, model: model }
      if (effort !== undefined) payload.reasoningEffort = effort
      host.call('select', payload).then(
        (res) => {
          setBusy(false)
          if (res && res.ok) {
            closeMenu()
            load()
          } else {
            setActionError(res && res.error ? (res.error.message || res.error.code) : '选择失败')
          }
        },
        (e) => {
          setBusy(false)
          setActionError(String((e && e.message) || e))
        },
      )
    }

    const groups = (catalog && catalog.groups) || []
    const recents = (catalog && catalog.recents) || []
    const failures = (catalog && catalog.failures) || []
    const current = catalog ? catalog.current : null

    let currentModel = null
    if (current) {
      for (const g of groups) {
        for (const m of g.models) {
          if (m.id === current.model && g.id === current.provider) {
            currentModel = m
            break
          }
        }
        if (currentModel) break
      }
    }

    const currentLabel = currentModel ? currentModel.name : (current ? current.model : '选择模型')
    const reasoning = currentModel ? currentModel.reasoning : null
    const effectiveEffort = current && current.reasoningEffort !== undefined ? current.reasoningEffort : (reasoning ? reasoning.defaultEffort : undefined)
    let effortLabel
    if (reasoning) {
      if (effectiveEffort === undefined) effortLabel = '默认'
      else {
        const found = reasoning.efforts.find((effort) => effort.id === effectiveEffort)
        effortLabel = found ? found.name : effectiveEffort
      }
    }

    const q = query.trim().toLowerCase()
    const filteredGroups = groups.map((g) => {
      const models = q.length === 0
        ? g.models
        : g.models.filter((m) =>
            (m.name || '').toLowerCase().indexOf(q) >= 0 ||
            (m.id || '').toLowerCase().indexOf(q) >= 0 ||
            (g.name || '').toLowerCase().indexOf(q) >= 0)
      return { id: g.id, name: g.name, models: models }
    }).filter((g) => g.models.length > 0)

    const filteredRecents = q.length === 0
      ? recents
      : recents.filter((r) =>
          (r.name || '').toLowerCase().indexOf(q) >= 0 ||
          (r.model || '').toLowerCase().indexOf(q) >= 0 ||
          (r.providerName || '').toLowerCase().indexOf(q) >= 0)

    let firstChoice = null
    if (filteredRecents.length > 0) {
      firstChoice = { provider: filteredRecents[0].provider, model: filteredRecents[0].model }
    } else if (filteredGroups.length > 0 && filteredGroups[0].models.length > 0) {
      firstChoice = { provider: filteredGroups[0].id, model: filteredGroups[0].models[0].id }
    }

    const triggerChildren = [
      React.createElement('span', { className: 'ms-trigger-label' }, currentLabel),
    ]
    if (effortLabel !== undefined) {
      triggerChildren.push(React.createElement('span', { className: 'ms-trigger-effort' }, effortLabel))
    }
    triggerChildren.push(React.createElement('span', { className: 'ms-chevron' + (open ? ' ms-chevron-open' : '') }, '\u25BE'))

    const trigger = React.createElement('button', {
      type: 'button',
      className: 'ms-trigger',
      title: effortLabel !== undefined ? (currentLabel + ' · ' + effortLabel) : currentLabel,
      disabled: locked,
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      onClick: () => { if (open) closeMenu(); else openMenu() },
    }, ...triggerChildren)

    let menu = null
    if (open) {
      const children = []

      children.push(React.createElement('input', {
        key: 'search',
        className: 'ms-search',
        type: 'text',
        placeholder: '搜索模型 / 提供商…',
        value: query,
        autoFocus: true,
        onChange: (e) => setQuery(e.target.value),
        onKeyDown: (e) => {
          if (e.key === 'Escape') { e.stopPropagation(); closeMenu() }
          else if (e.key === 'Enter' && firstChoice) doSelect(firstChoice.provider, firstChoice.model)
        },
      }))

      if (error) children.push(React.createElement('div', { key: 'error', className: 'ms-error' }, error))
      if (actionError) children.push(React.createElement('div', { key: 'actionError', className: 'ms-error' }, actionError))
      if (loading && groups.length === 0 && !error) children.push(React.createElement('div', { key: 'loading', className: 'ms-status' }, '正在加载模型…'))

      if (filteredRecents.length > 0) {
        const items = filteredRecents.map((r) =>
          React.createElement('button', {
            key: 'recent:' + r.provider + '/' + r.model,
            type: 'button',
            className: 'ms-option' + (current && current.provider === r.provider && current.model === r.model ? ' ms-option-selected' : ''),
            disabled: busy,
            onClick: () => doSelect(r.provider, r.model),
          },
            React.createElement('span', { className: 'ms-option-name' }, r.name),
            React.createElement('span', { className: 'ms-option-desc' }, r.providerName),
          ))
        children.push(React.createElement('div', { key: 'recents', className: 'ms-section' },
          React.createElement('div', { className: 'ms-section-title' }, '最近使用'),
          ...items,
        ))
      }

      const groupNodes = filteredGroups.map((g) => {
        const isCollapsed = !!collapsed[g.id]
        const header = React.createElement('button', {
          type: 'button',
          className: 'ms-group-title',
          onClick: () => setCollapsed(Object.assign({}, collapsed, { [g.id]: !isCollapsed })),
        },
          React.createElement('span', { className: 'ms-group-title-label' }, g.name),
          React.createElement('span', { className: 'ms-group-count' }, String(g.models.length)),
          React.createElement('span', { className: 'ms-chevron' + (isCollapsed ? '' : ' ms-chevron-open') }, '\u25BE'),
        )
        const modelNodes = isCollapsed ? [] : g.models.map((m) => {
          const selected = current && current.provider === g.id && current.model === m.id
          return React.createElement('button', {
            key: g.id + '/' + m.id,
            type: 'button',
            className: 'ms-option' + (selected ? ' ms-option-selected' : ''),
            disabled: busy,
            onClick: () => doSelect(g.id, m.id),
          },
            React.createElement('span', { className: 'ms-option-copy' },
              React.createElement('span', { className: 'ms-option-name' }, m.name),
              m.description ? React.createElement('span', { className: 'ms-option-desc' }, m.description) : null,
            ),
            selected ? React.createElement('span', { className: 'ms-check' }, '\u2713') : null,
          )
        })
        return React.createElement('div', { key: 'group:' + g.id, className: 'ms-group' }, header, ...modelNodes)
      })

      children.push(React.createElement('div', { key: 'groups', className: 'ms-groups' }, ...groupNodes))

      if (filteredGroups.length === 0 && filteredRecents.length === 0 && !loading && !error) {
        children.push(React.createElement('div', { key: 'empty', className: 'ms-empty' }, '没有匹配的模型'))
      }

      if (failures.length > 0) {
        children.push(React.createElement('div', { key: 'failures', className: 'ms-warnings' },
          failures.map((f) => React.createElement('div', { key: 'fail:' + f.id, className: 'ms-warning' }, (f.name || f.id) + ' 加载失败')),
        ))
      }

      if (current && reasoning && reasoning.efforts.length > 0) {
        const chips = []
        if (reasoning.defaultEffort === undefined) {
          chips.push(React.createElement('button', {
            key: 'effort:default',
            type: 'button',
            className: 'ms-effort' + (effectiveEffort === undefined ? ' ms-effort-active' : ''),
            disabled: busy,
            onClick: () => doSelect(current.provider, current.model, undefined),
          }, '默认'))
        }
        reasoning.efforts.forEach((effort) => {
          chips.push(React.createElement('button', {
            key: 'effort:' + effort.id,
            type: 'button',
            className: 'ms-effort' + (effectiveEffort === effort.id ? ' ms-effort-active' : ''),
            disabled: busy,
            onClick: () => doSelect(current.provider, current.model, effort.id),
          }, effort.name))
        })
        children.push(React.createElement('div', { key: 'efforts', className: 'ms-efforts' },
          React.createElement('div', { className: 'ms-section-title' }, '推理强度'),
          ...chips,
        ))
      }

      menu = React.createElement('div', {
        className: 'ms-menu',
        role: 'menu',
        onBlur: (e) => {
          const rt = e.relatedTarget
          if (rt && e.currentTarget && e.currentTarget.contains && e.currentTarget.contains(rt)) return
          closeMenu()
        },
      }, ...children)
    }

    return React.createElement('div', { className: 'ms-root' }, trigger, menu)
  }

  return {
    apply(ctx) {
      const slots = ctx.get('slots')
      if (slots === undefined) return
      styles.insert(CSS)
      slots.inject('conversation.input.model', () => slots.register(
        { name: 'conversation.input.model' },
        (p) => React.createElement(ModelSelect, { locked: p.locked, sessionId: p.sessionId }),
      ))
    },
  }
}
