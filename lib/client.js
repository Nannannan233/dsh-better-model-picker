/**
 * dsh-better-model-picker — formal DSH Web client bundle.
 *
 * Loaded by the DSH client-modules loader (because package.json declares
 * `dsh.client`). Registers the `conversation.input.model` composer seat with a
 * searchable / provider-grouped / recently-used model picker. Model data and
 * selection go through the built-in `connection.api.sessions.models` /
 * `connection.api.sessions.selectModel` RPCs — no Host half required.
 */
window.__ModuleLoader__.load({
  id: "dsh-better-model-picker",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var react = require("react");

    var CSS = ".ms-root{position:relative;min-width:0}" +
      ".ms-trigger{min-width:0;max-width:220px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}" +
      ".ms-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}" +
      ".ms-trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}" +
      ".ms-trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}" +
      ".ms-trigger-label{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}" +
      ".ms-trigger-effort{color:var(--dsw-alias-label-caption);flex:none}" +
      ".ms-chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s;font-size:10px;line-height:1}" +
      ".ms-chevron-open{transform:rotate(180deg)}" +
      ".ms-menu{z-index:20;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);width:min(320px,100vw - 32px);max-height:min(440px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:12px;flex-direction:column;padding:6px;display:flex;position:absolute;bottom:calc(100% + 8px);right:0;overflow:hidden}" +
      ".ms-search{margin:0 0 6px;padding:6px 10px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);border:1px solid var(--dsw-alias-border-inverted);border-radius:8px;outline:none}" +
      ".ms-search:focus{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}" +
      ".ms-groups{overflow:auto;min-height:0}" +
      ".ms-group{border-top:1px solid var(--dsw-alias-border-inverted);padding-top:2px;margin-top:2px}" +
      ".ms-group:first-child{border-top:none;margin-top:0}" +
      ".ms-group-title{width:100%;display:flex;align-items:center;gap:6px;padding:5px 8px;font-size:11px;font-weight:600;letter-spacing:.02em;color:var(--dsw-alias-label-tertiary);background:0 0;border:none;cursor:pointer;border-radius:6px;text-align:left}" +
      ".ms-group-title:hover{background:var(--dsw-alias-interactive-bg-hover)}" +
      ".ms-group-title-label{flex:1;min-width:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}" +
      ".ms-group-count{color:var(--dsw-alias-label-caption)}" +
      ".ms-option{width:100%;display:flex;align-items:center;gap:8px;padding:6px 8px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);background:0 0;border:none;border-radius:8px;cursor:pointer;text-align:left}" +
      ".ms-option:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}" +
      ".ms-option:disabled{cursor:default;opacity:.6}" +
      ".ms-option-selected{background:var(--dsw-alias-interactive-bg-hover)}" +
      ".ms-option-copy{flex:1;min-width:0;display:flex;flex-direction:column}" +
      ".ms-option-name{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}" +
      ".ms-option-desc{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}" +
      ".ms-check{color:var(--dsw-alias-label-secondary);flex:none}" +
      ".ms-section{margin-bottom:4px}" +
      ".ms-section-title{padding:4px 8px;font-size:11px;font-weight:600;letter-spacing:.02em;color:var(--dsw-alias-label-tertiary)}" +
      ".ms-efforts{display:flex;flex-wrap:wrap;gap:4px;padding:4px 0 2px}" +
      ".ms-effort{font-size:12px;line-height:18px;padding:2px 8px;border-radius:12px;border:1px solid var(--dsw-alias-border-inverted);background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer}" +
      ".ms-effort:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}" +
      ".ms-effort-active{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}" +
      ".ms-status,.ms-empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}" +
      ".ms-error{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;padding:7px 8px;font-size:12px;line-height:18px;margin-bottom:6px}" +
      ".ms-warning{color:var(--dsw-alias-state-warn-label);font-size:12px;line-height:18px;padding:4px 8px}";

    var TAG_ID = "dsh-better-model-picker/model-picker.css";
    if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + TAG_ID + '"]') === null) {
      var styleTag = document.createElement("style");
      styleTag.setAttribute("data-plugin-css", TAG_ID);
      styleTag.textContent = CSS;
      document.head.appendChild(styleTag);
    }

    var RECENTS_KEY = "dsh-better-model-picker:recents:v1";
    var recentsCache = null;
    function readRecents() {
      if (recentsCache !== null) return recentsCache;
      try {
        var raw = localStorage.getItem(RECENTS_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            recentsCache = parsed;
            return recentsCache;
          }
        }
      } catch (_e) {}
      recentsCache = [];
      return recentsCache;
    }
    function writeRecents(list) {
      recentsCache = list;
      try { localStorage.setItem(RECENTS_KEY, JSON.stringify(list)); } catch (_e) {}
    }

    function el(type, props) {
      var children = Array.prototype.slice.call(arguments, 2);
      return react.createElement.apply(null, [type, props].concat(children));
    }

    function findModelName(catalog, provider, model) {
      if (catalog && catalog.groups) {
        for (var i = 0; i < catalog.groups.length; i++) {
          var g = catalog.groups[i];
          if (g.id !== provider) continue;
          for (var j = 0; j < g.models.length; j++) {
            if (g.models[j].id === model) return g.models[j].name;
          }
        }
      }
      return model;
    }

    function ModelSelect(props) {
      var locked = !!props.locked;
      var available = props.available !== false;
      var load = props.load;
      var select = props.select;

      var sCatalog = react.useState(null);
      var catalog = sCatalog[0];
      var setCatalog = sCatalog[1];
      var sLoading = react.useState(false);
      var loading = sLoading[0];
      var setLoading = sLoading[1];
      var sError = react.useState(null);
      var error = sError[0];
      var setError = sError[1];
      var sOpen = react.useState(false);
      var open = sOpen[0];
      var setOpen = sOpen[1];
      var sQuery = react.useState("");
      var query = sQuery[0];
      var setQuery = sQuery[1];
      var sCollapsed = react.useState({});
      var collapsed = sCollapsed[0];
      var setCollapsed = sCollapsed[1];
      var sBusy = react.useState(false);
      var busy = sBusy[0];
      var setBusy = sBusy[1];
      var sActionError = react.useState(null);
      var actionError = sActionError[0];
      var setActionError = sActionError[1];
      var sRecents = react.useState([]);
      var recents = sRecents[0];
      var setRecents = sRecents[1];

      function doLoad() {
        if (!available || typeof load !== "function") return;
        setLoading(true);
        setError(null);
        Promise.resolve(load()).then(function (result) {
          if (result && result.ok) {
            setCatalog(result.value);
            setRecents(readRecents());
          } else {
            setError(result && result.error ? (result.error.message || result.error.code) : "加载失败");
          }
          setLoading(false);
        }, function (e) {
          setError(String((e && e.message) || e));
          setLoading(false);
        });
      }

      react.useEffect(function () { doLoad(); }, []);

      function openMenu() { setOpen(true); setQuery(""); setActionError(null); doLoad(); }
      function closeMenu() { setOpen(false); setQuery(""); }

      function doSelect(provider, model, effort) {
        if (busy || typeof select !== "function") return;
        setBusy(true);
        setActionError(null);
        var payload = { provider: provider, model: model };
        if (effort !== undefined) payload.reasoningEffort = effort;
        Promise.resolve(select(payload)).then(function (result) {
          setBusy(false);
          if (result && result.ok) {
            var selected = result.value && result.value.selected;
            if (selected) {
              var name = findModelName(catalog, selected.provider, selected.model);
              var list = readRecents().filter(function (r) {
                return !(r.provider === selected.provider && r.model === selected.model);
              });
              list.unshift({ provider: selected.provider, model: selected.model, name: name });
              if (list.length > 8) list.length = 8;
              writeRecents(list);
              setRecents(list);
            }
            closeMenu();
            doLoad();
          } else {
            setActionError(result && result.error ? (result.error.message || result.error.code) : "选择失败");
          }
        }, function (e) {
          setBusy(false);
          setActionError(String((e && e.message) || e));
        });
      }

      if (!available) return null;

      var groups = (catalog && catalog.groups) || [];
      var failures = (catalog && catalog.failures) || [];
      var current = catalog ? catalog.current : null;

      var currentModel = null;
      if (current) {
        for (var gi = 0; gi < groups.length; gi++) {
          var grp = groups[gi];
          for (var mi = 0; mi < grp.models.length; mi++) {
            var mm = grp.models[mi];
            if (mm.id === current.model && grp.id === current.provider) { currentModel = mm; break; }
          }
          if (currentModel) break;
        }
      }

      var currentLabel = currentModel ? currentModel.name : (current ? current.model : "选择模型");
      var reasoning = currentModel ? currentModel.reasoning : null;
      var effectiveEffort = current && current.reasoningEffort !== undefined ? current.reasoningEffort : (reasoning ? reasoning.defaultEffort : undefined);
      var effortLabel;
      if (reasoning) {
        if (effectiveEffort === undefined) effortLabel = "默认";
        else {
          var eff = null;
          for (var ei = 0; ei < reasoning.efforts.length; ei++) {
            if (reasoning.efforts[ei].id === effectiveEffort) { eff = reasoning.efforts[ei]; break; }
          }
          effortLabel = eff ? eff.name : effectiveEffort;
        }
      }

      var q = query.trim().toLowerCase();
      var filteredGroups = groups.map(function (g) {
        var models = q.length === 0 ? g.models : g.models.filter(function (m) {
          return (m.name || "").toLowerCase().indexOf(q) >= 0 ||
            (m.id || "").toLowerCase().indexOf(q) >= 0 ||
            (g.name || "").toLowerCase().indexOf(q) >= 0;
        });
        return { id: g.id, name: g.name, models: models };
      }).filter(function (g) { return g.models.length > 0; });

      var filteredRecents = q.length === 0 ? recents : recents.filter(function (r) {
        return (r.name || "").toLowerCase().indexOf(q) >= 0 ||
          (r.model || "").toLowerCase().indexOf(q) >= 0 ||
          (r.provider || "").toLowerCase().indexOf(q) >= 0;
      });

      var firstChoice = null;
      if (filteredRecents.length > 0) {
        firstChoice = { provider: filteredRecents[0].provider, model: filteredRecents[0].model };
      } else if (filteredGroups.length > 0 && filteredGroups[0].models.length > 0) {
        firstChoice = { provider: filteredGroups[0].id, model: filteredGroups[0].models[0].id };
      }

      var triggerChildren = [
        el("span", { className: "ms-trigger-label" }, currentLabel)
      ];
      if (effortLabel !== undefined) {
        triggerChildren.push(el("span", { className: "ms-trigger-effort" }, effortLabel));
      }
      triggerChildren.push(el("span", { className: "ms-chevron" + (open ? " ms-chevron-open" : "") }, "\u25BE"));

      var trigger = el.apply(null, ["button", {
        type: "button",
        className: "ms-trigger",
        title: effortLabel !== undefined ? (currentLabel + " · " + effortLabel) : currentLabel,
        disabled: locked,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        onClick: function () { if (open) closeMenu(); else openMenu(); }
      }].concat(triggerChildren));

      var menu = null;
      if (open) {
        var children = [];

        children.push(el("input", {
          key: "search",
          className: "ms-search",
          type: "text",
          placeholder: "搜索模型 / 提供商…",
          value: query,
          autoFocus: true,
          onChange: function (e) { setQuery(e.target.value); },
          onKeyDown: function (e) {
            if (e.key === "Escape") { e.stopPropagation(); closeMenu(); }
            else if (e.key === "Enter" && firstChoice) doSelect(firstChoice.provider, firstChoice.model);
          }
        }));

        if (error) children.push(el("div", { key: "error", className: "ms-error" }, error));
        if (actionError) children.push(el("div", { key: "actionError", className: "ms-error" }, actionError));
        if (loading && groups.length === 0 && !error) children.push(el("div", { key: "loading", className: "ms-status" }, "正在加载模型…"));

        if (filteredRecents.length > 0) {
          var recentItems = filteredRecents.map(function (r) {
            return el("button", {
              key: "recent:" + r.provider + "/" + r.model,
              type: "button",
              className: "ms-option" + (current && current.provider === r.provider && current.model === r.model ? " ms-option-selected" : ""),
              disabled: busy,
              onClick: function () { doSelect(r.provider, r.model); }
            },
              el("span", { className: "ms-option-name" }, r.name),
              el("span", { className: "ms-option-desc" }, r.provider)
            );
          });
          children.push(el.apply(null, ["div", { key: "recents", className: "ms-section" }].concat(
            [el("div", { className: "ms-section-title" }, "最近使用")].concat(recentItems)
          )));
        }

        var groupNodes = filteredGroups.map(function (g) {
          var isCollapsed = !!collapsed[g.id];
          var header = el("button", {
            type: "button",
            className: "ms-group-title",
            onClick: function () {
              var next = {};
              for (var k in collapsed) next[k] = collapsed[k];
              next[g.id] = !isCollapsed;
              setCollapsed(next);
            }
          },
            el("span", { className: "ms-group-title-label" }, g.name),
            el("span", { className: "ms-group-count" }, String(g.models.length)),
            el("span", { className: "ms-chevron" + (isCollapsed ? "" : " ms-chevron-open") }, "\u25BE")
          );
          var modelNodes = isCollapsed ? [] : g.models.map(function (m) {
            var selected = current && current.provider === g.id && current.model === m.id;
            return el("button", {
              key: g.id + "/" + m.id,
              type: "button",
              className: "ms-option" + (selected ? " ms-option-selected" : ""),
              disabled: busy,
              onClick: function () { doSelect(g.id, m.id); }
            },
              el("span", { className: "ms-option-copy" },
                el("span", { className: "ms-option-name" }, m.name),
                m.description ? el("span", { className: "ms-option-desc" }, m.description) : null
              ),
              selected ? el("span", { className: "ms-check" }, "\u2713") : null
            );
          });
          return el.apply(null, ["div", { key: "group:" + g.id, className: "ms-group" }].concat([header].concat(modelNodes)));
        });

        children.push(el.apply(null, ["div", { key: "groups", className: "ms-groups" }].concat(groupNodes)));

        if (filteredGroups.length === 0 && filteredRecents.length === 0 && !loading && !error) {
          children.push(el("div", { key: "empty", className: "ms-empty" }, "没有匹配的模型"));
        }

        if (failures.length > 0) {
          children.push(el.apply(null, ["div", { key: "failures", className: "ms-warnings" }].concat(
            failures.map(function (f) {
              return el("div", { key: "fail:" + f.id, className: "ms-warning" }, (f.name || f.id) + " 加载失败");
            })
          )));
        }

        if (current && reasoning && reasoning.efforts.length > 0) {
          var chips = [];
          if (reasoning.defaultEffort === undefined) {
            chips.push(el("button", {
              key: "effort:default",
              type: "button",
              className: "ms-effort" + (effectiveEffort === undefined ? " ms-effort-active" : ""),
              disabled: busy,
              onClick: function () { doSelect(current.provider, current.model, undefined); }
            }, "默认"));
          }
          reasoning.efforts.forEach(function (effort) {
            chips.push(el("button", {
              key: "effort:" + effort.id,
              type: "button",
              className: "ms-effort" + (effectiveEffort === effort.id ? " ms-effort-active" : ""),
              disabled: busy,
              onClick: function () { doSelect(current.provider, current.model, effort.id); }
            }, effort.name));
          });
          children.push(el.apply(null, ["div", { key: "efforts", className: "ms-efforts" }].concat(
            [el("div", { className: "ms-section-title" }, "推理强度")].concat(chips)
          )));
        }

        menu = el.apply(null, ["div", {
          className: "ms-menu",
          role: "menu",
          onBlur: function (e) {
            var rt = e.relatedTarget;
            if (rt && e.currentTarget && e.currentTarget.contains && e.currentTarget.contains(rt)) return;
            closeMenu();
          }
        }].concat(children));
      }

      return el("div", { className: "ms-root" }, trigger, menu);
    }

    var inject = ["connection", "sessions", "slots"];

    function apply(ctx) {
      var slots = ctx.slots;
      var connection = ctx.connection;
      var sessions = ctx.sessions;
      if (!slots || !connection || !sessions) return;
      var api = connection.api && connection.api.sessions;
      if (!api) return;

      slots.inject("conversation.input.model", function () {
        return slots.register({
          name: "conversation.input.model",
          inject: function (sessionId) {
            var available = typeof sessions.subagentAddress === "function"
              ? sessions.subagentAddress(sessionId) === undefined
              : true;
            return {
              available: available,
              load: function () {
                return api.models({ sessionId: sessionId }).then(function (resp) { return resp.result; });
              },
              select: function (selection) {
                var payload = {
                  sessionId: sessionId,
                  provider: selection.provider,
                  model: selection.model
                };
                if (selection.reasoningEffort !== undefined) payload.reasoningEffort = selection.reasoningEffort;
                return api.selectModel(payload).then(function (resp) { return resp.result; });
              }
            };
          }
        }, ModelSelect);
      });
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
