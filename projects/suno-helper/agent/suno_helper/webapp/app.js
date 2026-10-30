/* Suno Helper — agent app.
 *
 * Plain DOM, no framework, no bundler. Three rules hold this file together:
 *
 * 1. Every number on screen came from the server on this load. Nothing is
 *    cached across renders except the goal form, which is editable state.
 * 2. Writes send `X-Suno-Helper` (and the token when one is configured), which
 *    is also the CSRF check on the server.
 * 3. The stream is read with `fetch` + ReadableStream rather than
 *    `EventSource`, because `EventSource` cannot attach headers and the token
 *    has to travel in one.
 */

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const el = (tag, props = {}, children = []) => {
    const node = document.createElement(tag);
    Object.assign(node, props);
    for (const child of Array.isArray(children) ? children : [children]) {
      if (child == null) continue;
      node.append(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  };

  const state = {
    token: localStorage.getItem('sh-token') || '',
    readonly: false,
    running: false,
    view: 'dashboard',
    summary: null,
  };

  // ------------------------------------------------------------------ utils
  function toast(message, isError = false) {
    const node = $('toast');
    node.textContent = message;
    node.classList.toggle('err', isError);
    node.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => node.classList.remove('show'), 2600);
  }

  function headers(json = false) {
    const out = { 'X-Suno-Helper': '1' };
    if (json) out['Content-Type'] = 'application/json';
    if (state.token) out['X-Suno-Helper-Token'] = state.token;
    return out;
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      headers: options.body ? headers(true) : headers(false),
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = { ok: false, error: `HTTP ${response.status}` };
    }
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || `HTTP ${response.status}`);
    }
    return payload.data;
  }

  const fmt = (n) => (typeof n === 'number' ? n.toLocaleString() : String(n ?? '—'));
  const pct = (n) => `${Math.round(n)}%`;

  // ------------------------------------------------------------------- goal
  function renderSummary(data) {
    state.summary = data;
    state.readonly = data.readonly;
    const goal = data.goal;
    $('goal-title').textContent = goal.title || 'Untitled goal';
    $('goal-status').textContent = goal.status || '—';
    $('goal-status').className = `pill ${goal.status === 'complete' ? 'chip done' : 'chip open'}`;
    const progress = data.progress ?? 0;
    $('goal-fill').style.width = `${progress}%`;
    $('goal-bar').setAttribute('aria-valuenow', String(Math.round(progress)));
    $('goal-progress').textContent = `${progress.toFixed(1)} / ${goal.target}`;
    $('goal-metric').textContent = goal.metric || '';
    $('turn-badge').textContent = `turn ${fmt(data.turn)}`;

    // The form is only written when the user is not editing it.
    const active = document.activeElement;
    const editing = active && active.closest && active.closest('.goal-form');
    if (!editing) {
      $('f-title').value = goal.title || '';
      $('f-statement').value = goal.statement || '';
      $('f-metric').value = goal.metric || '';
      $('f-target').value = goal.target ?? 100;
    }

    const counts = data.subgoal_counts || {};
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const ledger = data.ledger || {};
    const stats = [
      { k: 'turns', v: fmt(data.turn), d: `${ledger.turns ?? 0} in ledger` },
      { k: 'subgoals', v: `${counts.done || 0}/${total}`, d: `${counts.open || 0} open · ${counts.blocked || 0} blocked` },
      { k: 'capabilities', v: `${data.capabilities.ready}/${data.capabilities.total}`, d: 'evidence present' },
      {
        k: 'success',
        v: ledger.success_rate != null ? pct(ledger.success_rate * 100) : '—',
        d: `${(ledger.outcomes || {}).fail ?? (ledger.outcomes || {}).failed ?? 0} failed turns`,
      },
      { k: 'skills', v: fmt(data.skills), d: 'discoverable' },
      { k: 'sources', v: fmt(data.research.sources), d: `${data.research.open_questions} open questions` },
    ];
    $('stats').replaceChildren(
      ...stats.map((s) =>
        el('div', { className: 'stat' }, [
          el('div', { className: 'k', textContent: s.k }),
          el('div', { className: 'v', textContent: String(s.v) }),
          el('div', { className: 'd', textContent: s.d }),
        ]),
      ),
    );

    $('save-goal').disabled = state.readonly;
    $('add-subgoal').disabled = state.readonly;
    $('run').disabled = state.readonly || state.running;
    $('stop').disabled = !state.running;
    $('token-btn').hidden = !state.readonly;
  }

  async function refresh() {
    try {
      renderSummary(await api('/api/state'));
      $('health').textContent = `v${state.summary.version} · ${state.readonly ? 'read-only' : 'writable'}`;
    } catch (error) {
      $('health').textContent = 'offline';
      toast(error.message, true);
    }
  }

  async function saveGoal() {
    try {
      await api('/api/goal', {
        method: 'POST',
        body: {
          title: $('f-title').value.trim(),
          statement: $('f-statement').value.trim(),
          metric: $('f-metric').value.trim(),
          target: Number($('f-target').value) || 100,
        },
      });
      $('goal-save-note').textContent = 'saved';
      await refresh();
      toast('Goal written to /goal');
    } catch (error) {
      toast(error.message, true);
    }
  }

  // ------------------------------------------------------------------- log
  function logLine(entry) {
    const phase = (entry.phase || 'work').toLowerCase();
    const message = [entry.subgoal || '', entry.tool ? `· ${entry.tool}` : '', entry.notes || '']
      .filter(Boolean)
      .join(' ');
    return el('li', { className: entry.ok ? 'ok' : 'fail' }, [
      el('span', { className: 't', textContent: `#${entry.turn}` }),
      el('span', { className: `p ${phase}`, textContent: phase }),
      el('span', { className: 'msg', textContent: message || entry.outcome || '' }),
    ]);
  }

  function pushLog(entry) {
    const log = $('log');
    if (log.firstElementChild && log.firstElementChild.classList.contains('empty')) log.replaceChildren();
    log.prepend(logLine(entry));
    while (log.children.length > 300) log.lastElementChild.remove();
  }

  // ---------------------------------------------------------------- stream
  async function runTurns(turns) {
    if (state.running) return;
    state.running = true;
    $('run').disabled = true;
    $('stop').disabled = false;
    $('stream-state').textContent = 'running';
    const started = performance.now();

    try {
      const response = await fetch(`/api/stream?turns=${turns}`, { headers: headers(false) });
      if (!response.ok || !response.body) {
        const text = await response.text();
        throw new Error(text.slice(0, 200) || `HTTP ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let split;
        while ((split = buffer.indexOf('\n\n')) >= 0) {
          const chunk = buffer.slice(0, split);
          buffer = buffer.slice(split + 2);
          handleEvent(chunk);
        }
      }
    } catch (error) {
      toast(error.message, true);
    } finally {
      state.running = false;
      $('run').disabled = state.readonly;
      $('stop').disabled = true;
      $('stream-state').textContent = `idle · ${((performance.now() - started) / 1000).toFixed(1)}s`;
      await refresh();
    }
  }

  function handleEvent(chunk) {
    let event = 'message';
    const dataLines = [];
    for (const line of chunk.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) return;
    let data;
    try {
      data = JSON.parse(dataLines.join('\n'));
    } catch {
      return;
    }

    if (event === 'turn') {
      pushLog(data);
      $('goal-fill').style.width = `${data.progress}%`;
      $('goal-progress').textContent = `${data.progress.toFixed(1)} / ${data.goal_target}`;
      $('turn-badge').textContent = `turn ${fmt(data.turn)}`;
    } else if (event === 'start') {
      toast(`running ${data.turns} turn(s)`);
    } else if (event === 'done') {
      $('goal-status').textContent = data.goal.status;
      toast(`${data.turns} turn(s)${data.stopped ? ' (stopped)' : ''} · goal ${data.progress.toFixed(1)}`);
    } else if (event === 'error') {
      toast(data.error || 'stream error', true);
    }
  }

  // --------------------------------------------------------------- subgoals
  function statusOf(sub) {
    if (sub.status) return sub.status;
    return sub.done ? 'done' : 'open';
  }

  async function loadSubgoals() {
    const rows = await api('/api/subgoals');
    const filter = ($('subgoal-filter').value || '').toLowerCase();
    const visible = rows.filter(
      (row) => !filter || `${row.title} ${row.id} ${row.description || ''}`.toLowerCase().includes(filter),
    );

    $('subgoal-list').replaceChildren(
      ...visible.map((row) => {
        const status = statusOf(row);
        const accept = (row.acceptance || []).map((gate) =>
          el('li', { textContent: `${gate.tool || gate.check || 'check'}${gate.expect ? ` → ${gate.expect}` : ''}` }),
        );
        return el('div', { className: `sg ${status}` }, [
          el('div', { className: 'sg-head' }, [
            el('span', { className: 'sg-title', textContent: row.title }),
            el('span', { className: `chip ${status}`, textContent: status }),
          ]),
          el('div', { className: 'sg-meta' }, [
            el('span', { textContent: row.id }),
            el('span', { textContent: `p${row.priority}` }),
            el('span', { textContent: `w${row.weight}` }),
            el('span', { textContent: (row.stages || []).join(' · ') }),
            el('span', { textContent: row.action?.tool || '—' }),
          ]),
          row.description ? el('p', { className: 'sg-desc', textContent: row.description }) : null,
          accept.length ? el('ul', { className: 'sg-accept' }, accept) : null,
          status !== 'done'
            ? el('div', { className: 'sg-actions' }, [
                el('button', {
                  className: 'btn',
                  textContent: 'Complete',
                  disabled: state.readonly,
                  onclick: () => completeSubgoal(row.id),
                }),
              ])
            : null,
        ]);
      }),
    );
    if (!visible.length) $('subgoal-list').replaceChildren(el('p', { className: 'muted', textContent: 'nothing matches' }));
  }

  async function completeSubgoal(id) {
    try {
      await api('/api/subgoal/complete', { method: 'POST', body: { id, evidence: 'completed from the app' } });
      toast(`completed ${id}`);
      await Promise.all([loadSubgoals(), refresh()]);
    } catch (error) {
      toast(error.message, true);
    }
  }

  async function addSubgoal() {
    const title = $('s-title').value.trim();
    if (!title) return toast('a subgoal needs a title', true);
    const tool = $('s-tool').value.trim();
    try {
      await api('/api/subgoal', {
        method: 'POST',
        body: {
          title,
          description: $('s-desc').value.trim(),
          priority: Number($('s-priority').value) || 3,
          weight: Number($('s-weight').value) || 1,
          action: tool ? { tool, args: {} } : null,
          acceptance: tool ? [{ tool, expect: 'pass' }] : [],
        },
      });
      $('s-title').value = '';
      $('s-desc').value = '';
      $('s-tool').value = '';
      $('subgoal-note').textContent = 'added';
      await Promise.all([loadSubgoals(), refresh()]);
      toast('Subgoal added');
    } catch (error) {
      toast(error.message, true);
    }
  }

  // ----------------------------------------------------------------- ledger
  async function loadLedger() {
    const limit = Number($('ledger-limit').value) || 100;
    const rows = await api(`/api/ledger?limit=${limit}`);
    const head = el('tr', {}, [
      el('th', { textContent: 'turn' }),
      el('th', { textContent: 'phase' }),
      el('th', { textContent: 'outcome' }),
      el('th', { textContent: 'subgoal' }),
      el('th', { textContent: 'tool' }),
      el('th', { textContent: 'ms' }),
      el('th', { textContent: 'notes' }),
    ]);
    const body = rows
      .slice()
      .reverse()
      .map((row) =>
        el('tr', { className: row.ok ? '' : 'fail' }, [
          el('td', { textContent: String(row.turn ?? '') }),
          el('td', { textContent: row.phase || '' }),
          el('td', { textContent: row.outcome || '' }),
          el('td', { textContent: row.subgoal_id || row.subgoal || '-' }),
          el('td', { textContent: row.tool || '-' }),
          el('td', { textContent: String(row.duration_ms ?? '') }),
          el('td', { className: 'wrap', textContent: (row.notes || row.summary || '').slice(0, 160) }),
        ]),
      );
    $('ledger-wrap').replaceChildren(el('table', {}, [el('thead', {}, [head]), el('tbody', {}, body)]));
  }

  // ----------------------------------------------------------- capabilities
  async function loadCapabilities() {
    const rows = await api('/api/capabilities');
    const ready = rows.filter((row) => row.ready).length;
    $('cap-summary').textContent = `${ready} of ${rows.length} ready`;
    $('cap-list').replaceChildren(
      ...rows.map((row) =>
        el('div', { className: 'cap' }, [
          el('div', { className: 'cap-head' }, [
            el('span', { className: 'cap-name', textContent: row.title }),
            el('span', { className: `chip ${row.ready ? 'ready' : 'missing'}`, textContent: row.ready ? 'ready' : 'missing' }),
          ]),
          el('div', { className: 'cap-id', textContent: `${row.id} · ${row.phase}` }),
          el('p', { className: 'cap-sum', textContent: row.summary }),
        ]),
      ),
    );
  }

  // ------------------------------------------------------------------ gates
  async function loadGates() {
    const tools = await api('/api/tools');
    $('gate-buttons').replaceChildren(
      ...tools.map((tool) =>
        el('button', { className: 'btn', textContent: tool, onclick: () => runGate(tool) }),
      ),
    );
  }

  async function runGate(tool) {
    $('gate-output').textContent = `running ${tool}…`;
    try {
      const result = await api('/api/gate', { method: 'POST', body: { tool } });
      $('gate-output').textContent = JSON.stringify(result, null, 2);
      toast(`${tool}: ${result.ok ? 'pass' : 'fail'} · ${result.duration_ms}ms`, !result.ok);
      await refresh();
    } catch (error) {
      $('gate-output').textContent = `error: ${error.message}`;
      toast(error.message, true);
    }
  }

  // ------------------------------------------------------------- skills/crew
  async function loadCrew() {
    const [skills, crew] = await Promise.all([api('/api/skills'), api('/api/crew')]);
    $('skill-count').textContent = `${skills.length} skills`;
    $('skill-list').replaceChildren(
      ...skills.map((skill) =>
        el('div', { className: 'item' }, [
          el('div', { className: 'n', textContent: skill.name }),
          el('div', { className: 'd', textContent: skill.description }),
        ]),
      ),
    );
    $('crew-list').replaceChildren(
      ...crew.map((role) =>
        el('div', { className: 'item' }, [
          el('div', { className: 'n', textContent: role.title || role.id }),
          el('div', { className: 'd', textContent: role.purpose || (role.skills || []).join(', ') }),
        ]),
      ),
    );
  }

  // ------------------------------------------------------------------- nav
  const loaders = {
    dashboard: refresh,
    subgoals: loadSubgoals,
    ledger: loadLedger,
    capabilities: loadCapabilities,
    gates: loadGates,
    crew: loadCrew,
  };

  function show(view) {
    state.view = view;
    document.querySelectorAll('.rail-item').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === view));
    document.querySelectorAll('.view').forEach((section) => (section.hidden = section.id !== `view-${view}`));
    const loader = loaders[view];
    if (loader) loader().catch((error) => toast(error.message, true));
  }

  // ------------------------------------------------------------------ init
  function bind() {
    $('run').addEventListener('click', () => {
      const turns = Math.max(1, Math.min(200, Number($('turns').value) || 1));
      runTurns(turns);
    });
    $('stop').addEventListener('click', async () => {
      try {
        await api('/api/stop', { method: 'POST', body: {} });
        toast('stop requested');
      } catch (error) {
        toast(error.message, true);
      }
    });
    $('save-goal').addEventListener('click', saveGoal);
    $('add-subgoal').addEventListener('click', addSubgoal);
    $('refresh-subgoals').addEventListener('click', () => loadSubgoals().catch((e) => toast(e.message, true)));
    $('subgoal-filter').addEventListener('input', () => loadSubgoals().catch(() => {}));
    $('refresh-ledger').addEventListener('click', () => loadLedger().catch((e) => toast(e.message, true)));
    $('token-btn').addEventListener('click', () => {
      const value = prompt('Write token printed by `suno_helper app`:', state.token);
      if (value == null) return;
      state.token = value.trim();
      localStorage.setItem('sh-token', state.token);
      refresh();
    });

    document.querySelectorAll('.rail-item').forEach((btn) =>
      btn.addEventListener('click', () => show(btn.dataset.view)),
    );

    document.addEventListener('keydown', (event) => {
      if (event.target.matches('input, textarea, select')) return;
      const views = ['dashboard', 'subgoals', 'ledger', 'capabilities', 'gates', 'crew'];
      if (/^[1-6]$/.test(event.key)) show(views[Number(event.key) - 1]);
      if (event.key === 'r' && !event.metaKey && !event.ctrlKey) $('run').click();
    });
  }

  bind();
  show('dashboard');
  refresh();
  setInterval(() => {
    if (!state.running) refresh();
  }, 15000);
})();
