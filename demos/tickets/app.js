(function () {
  'use strict';
  const E = window.PocEngine;
  const STORAGE_KEY = 'portfolio-ticket-demo-v2';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const escape = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const paths = {
    inbox:'M3 4h18v16H3z M3 13h5l2 3h4l2-3h5',
    book:'M12 5v16 M12 5C9 2 4 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-2-1-7-2-10 1z',
    activity:'M3 12h4l3-8 4 16 3-8h4',
    shield:'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6',
    play:'M8 4l12 8-12 8z',
    pause:'M8 5v14 M16 5v14',
    reset:'M3 10a9 9 0 1 1 2 8 M3 4v6h6',
    spark:'M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z',
    plus:'M12 5v14 M5 12h14',
    search:'M20 20l-5-5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
    mail:'M3 5h18v14H3z M3 5l9 8 9-8',
    step:'M5 5l10 7-10 7z M19 5v14',
    arrow:'M4 12h16 M14 6l6 6-6 6',
    download:'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',
    database:'M20 6c0 2-4 3-8 3s-8-1-8-3 4-3 8-3 8 1 8 3z M4 6v12c0 2 4 3 8 3s8-1 8-3V6 M4 12c0 2 4 3 8 3s8-1 8-3',
    api:'M8 6l-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18',
    check:'M5 12l4 4L19 6',
    clock:'M12 8v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
    file:'M14 3H5v18h14V8z M14 3v5h5 M8 12h8 M8 16h6',
    user:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-3c0-4 16-4 16 0v3',
    info:'M12 11v6 M12 7h.01 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
    alert:'M12 3L2 21h20z M12 9v5 M12 17h.01',
    copy:'M8 8h12v13H8z M16 8V3H3v13h5',
    link:'M10 14l4-4 M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0 M16 8l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0'
  };
  const icon = (name) => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (paths[name] || paths.info) + '"/></svg>';
  const hydrateIcons = () => $$('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
  const agents = [
    {id:'db', code:'AGENT_01', name:'Memoria · DB', description:'Busca soluciones en tickets anteriores.', icon:'database'},
    {id:'rag', code:'AGENT_02', name:'Conocimiento · RAG', description:'Encuentra respuestas en la documentación.', icon:'book'},
    {id:'api', code:'AGENT_03', name:'Diagnóstico · API', description:'Comprueba los datos del vehículo.', icon:'api'}
  ];
  const scenarios = {combined:['Los 3 agentes','blue'],known:['Caso conocido','green'],rag:['Consulta documental','purple'],api_failure:['Servicio no disponible','amber'],unknown:['Revisión humana','amber'],custom:['Tu caso de prueba','blue']};
  let state;
  let view = 'inbox';
  let evidenceTab = 'sources';
  let timer = null;
  let toastTimer = null;
  let playingId = null;
  let storageAvailable = true;
  let speed = 1800;

  function freshState() {
    const data = E.initialData();
    return {version:1,tickets:data.tickets,history:data.history,runs:{},activity:[],selectedId:data.tickets[0].id,nextId:2001};
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      const saved = JSON.parse(raw);
      if (saved.version !== 1 || !Array.isArray(saved.tickets) || !saved.tickets.length || !Array.isArray(saved.history) || !saved.runs || typeof saved.runs !== 'object' || !Array.isArray(saved.activity) || !Number.isInteger(saved.nextId)) return freshState();
      if (!saved.tickets.every((t) => t && typeof t.id === 'string' && typeof t.subject === 'string' && typeof t.body === 'string')) return freshState();
      if (!saved.history.every((h) => h && typeof h.solution === 'string')) return freshState();
      saved.runs = Object.fromEntries(Object.entries(saved.runs).filter(([,r]) => r && r.plan && Array.isArray(r.plan.steps) && Array.isArray(r.plan.sources) && Array.isArray(r.plan.apiCalls) && Array.isArray(r.plan.similarTickets) && Number.isInteger(r.cursor) && typeof r.draft === 'string' && ['paused','review','approved','needs_human','escalated'].includes(r.status)));
      saved.activity = saved.activity.filter((a) => a && typeof a.title === 'string' && typeof a.detail === 'string' && typeof a.time === 'string');
      if (!saved.tickets.some((t) => t.id === saved.selectedId)) saved.selectedId = saved.tickets[0].id;
      return saved;
    } catch (_) { storageAvailable = false; return freshState(); }
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (_) {
      if (storageAvailable) toast('El navegador no permite guardar la sesión. La demo sigue funcionando hasta cerrar la página.');
      storageAvailable = false;
    }
  }

  const selected = () => state.tickets.find((t) => t.id === state.selectedId) || state.tickets[0];
  const currentRun = () => state.runs[selected().id];
  const isComplete = (run) => Boolean(run && run.cursor >= run.plan.steps.length);
  const tag = (text, color = '') => '<span class="tag ' + color + '">' + escape(text) + '</span>';

  function log(title, detail, type = 'activity') {
    state.activity.unshift({title,detail,type,time:new Date().toISOString()});
  }

  function toast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 5000);
  }

  function renderMetrics() {
    const runs = Object.values(state.runs);
    const approved = state.history.filter((h) => h.validated && String(h.id).startsWith('LEARN-')).length;
    const pending = runs.filter((r) => ['review','needs_human'].includes(r.status)).length;
    const items = [
      {label:'Correos en la bandeja',value:state.tickets.length,note:'en esta demo',icon:'inbox'},
      {label:'Agentes especializados',value:'03',note:'DB · RAG · API',icon:'spark'},
      {label:'Pendientes de revisión',value:String(pending).padStart(2,'0'),note:'control humano',icon:'user'},
      {label:'Respuestas validadas',value:String(approved).padStart(2,'0'),note:'en esta sesión',icon:'check'}
    ];
    $('#metrics').innerHTML = items.map((m) => '<div class="metric-card"><div><span class="metric-label">' + m.label + '</span><span class="metric-value">' + m.value + '<span class="metric-note">' + m.note + '</span></span></div><span class="metric-icon">' + icon(m.icon) + '</span></div>').join('');
    $('#nav-count').textContent = state.tickets.length;
  }

  function renderInbox() {
    const query = $('#ticket-search').value.toLocaleLowerCase('es');
    const tickets = state.tickets.filter((t) => [t.subject,t.body,t.sender,t.company].join(' ').toLocaleLowerCase('es').includes(query));
    $('#inbox-summary').textContent = state.tickets.length + ' correos · datos ficticios';
    $('#ticket-list').innerHTML = tickets.map((t) => {
      const run = state.runs[t.id];
      const scenario = scenarios[t.scenario] || scenarios.custom;
      const statusTag = run?.status === 'approved' ? tag('Validado','green') : run?.status === 'escalated' ? tag('Derivado','amber') : isComplete(run) ? tag('Revisar','amber') : '';
      return '<button class="ticket-item ' + (t.id === state.selectedId ? 'selected' : '') + '" data-ticket="' + escape(t.id) + '" aria-pressed="' + (t.id === state.selectedId) + '"><div class="ticket-top"><span class="avatar">' + escape(t.initials) + '</span><span class="sender-name">' + escape(t.sender) + '</span><span class="ticket-time">' + escape(t.time) + '</span></div><h3 class="ticket-subject">' + escape(t.subject) + '</h3><p class="ticket-preview">' + escape(t.body) + '</p><div class="ticket-tags">' + tag(scenario[0],scenario[1]) + statusTag + '</div></button>';
    }).join('') || '<div class="search-empty">No hay correos que coincidan con la búsqueda.</div>';
  }

  function renderEmail() {
    const t = selected();
    $('#email-panel').innerHTML = '<div class="email-header"><div class="email-meta">' + icon('mail') + escape(t.id) + '<span>·</span> CORREO ENTRANTE</div>' + tag('Prioridad ' + t.priority.toLowerCase(),t.priority === 'Alta' ? 'amber' : '') + '</div><h2 class="email-title">' + escape(t.subject) + '</h2><div class="email-sender"><span class="avatar">' + escape(t.initials) + '</span><strong>' + escape(t.sender) + '</strong><small>' + escape(t.company) + '</small></div><p class="email-body">' + escape(t.body) + '</p><div class="email-bottom">' + tag(t.category) + '<span>Para: equipo de soporte</span></div>';
  }

  function agentState(agent, run) {
    if (!run) return {css:'waiting',label:'En espera',description:agent.description};
    const index = run.plan.steps.findIndex((s) => s.agent === agent.id);
    const step = run.plan.steps[index];
    if (!step || index > run.cursor) return {css:'waiting',label:'En espera',description:agent.description};
    if (index === run.cursor && step.status === 'skipped') return {css:'skipped',label:'No necesario',description:step.title};
    if (index === run.cursor) return {css:playingId ? 'working' : 'waiting',label:playingId ? 'Trabajando…' : 'Listo para continuar',description:agent.description};
    const labels = {done:'Completado',skipped:'No necesario',error:'Requiere intervención'};
    return {css:step.status,label:labels[step.status] || 'Completado',description:step.title};
  }

  function renderAgents() {
    const run = currentRun();
    $('#agent-flow').innerHTML = agents.map((a) => {
      const progress = agentState(a,run);
      return '<article class="agent-card ' + a.id + ' ' + progress.css + '" data-agent="' + a.id + '"><div class="agent-card-head"><span class="agent-icon">' + icon(a.icon) + '</span><span class="agent-code">' + a.code + '</span></div><h3>' + a.name + '</h3><p>' + escape(progress.description) + '</p><div class="agent-state"><span class="state-dot"></span>' + progress.label + '</div></article>';
    }).join('');
    const playing = playingId === selected().id;
    const done = isComplete(run);
    $('#run-btn').innerHTML = icon(playing ? 'pause' : done ? 'reset' : 'play') + (playing ? 'Pausar' : done ? 'Repetir caso' : run ? 'Continuar' : 'Resolver con agentes');
    $('#step-btn').disabled = playing || done;
    const status = $('#execution-status');
    status.className = 'execution-status';
    let message = 'Preparado para empezar · Puedes avanzar automáticamente o paso a paso.';
    let statusIcon = 'link';
    if (run && !done) {
      const next = run.plan.steps[run.cursor];
      const names = {manager:'Coordinador',db:'Agente DB',rag:'Agente RAG',api:'Agente API'};
      message = (playing ? 'En curso' : 'Pausado') + ' · ' + (names[next?.agent] || 'Coordinador') + ' · Paso ' + (run.cursor + 1) + ' de ' + run.plan.steps.length;
      status.classList.add('active');
      statusIcon = playing ? 'activity' : 'pause';
    } else if (done) {
      message = run.status === 'approved' ? 'Respuesta validada · Guardada en el CRM y la memoria simulados.' : run.status === 'escalated' ? 'Caso derivado al equipo humano · Derivación simulada registrada.' : run.plan.summary;
      status.classList.add(run.plan.needsHuman ? 'warn' : 'active');
      statusIcon = run.plan.needsHuman ? 'alert' : 'check';
    }
    status.innerHTML = icon(statusIcon) + '<span>' + escape(message) + '</span>';
    $('#trace-count').textContent = (run ? run.cursor : 0) + ' / 4 pasos';
    $('#trace-list').innerHTML = run ? run.plan.steps.map((s,i) => '<li class="' + (i >= run.cursor ? 'pending' : '') + '"><strong>' + escape(i < run.cursor ? s.title : i === run.cursor ? 'Siguiente: ' + ({manager:'coordinación',db:'histórico',rag:'documentación',api:'diagnóstico API'}[s.agent]) : 'En espera') + '</strong><p>' + escape(i < run.cursor ? s.detail : 'La evidencia se mostrará al completar este paso.') + '</p>' + (i < run.cursor && s.evidence.length ? '<p>' + s.evidence.map((e) => escape(e.label) + ': ' + escape(e.value)).join(' · ') + '</p>' : '') + '</li>').join('') : '<li class="pending"><strong>El recorrido aparecerá aquí</strong><p>Cada paso explica qué consulta el agente y qué aporta al caso.</p></li>';
  }

  function empty(iconName,title,description) {
    return '<div class="empty-state"><span class="empty-icon">' + icon(iconName) + '</span><strong>' + escape(title) + '</strong><p>' + escape(description) + '</p></div>';
  }

  function renderResponse() {
    const run = currentRun();
    const done = isComplete(run);
    const approved = run?.status === 'approved';
    const escalated = run?.status === 'escalated';
    const badge = approved ? tag('Validada','green') : escalated ? tag('Derivada','amber') : done ? tag(run.plan.needsHuman ? 'Intervención humana' : 'Borrador','amber') : tag('Pendiente');
    let html = '<div class="panel-heading"><div><span class="section-kicker">EL RESULTADO, BAJO TU CONTROL</span><h2>Respuesta propuesta</h2></div>' + badge + '</div>';
    if (!done) {
      html += empty('mail',run ? 'Los agentes están reuniendo contexto' : 'Una respuesta con respaldo','Aquí aparecerá el borrador al terminar el recorrido. Podrás revisarlo antes de validarlo.');
    } else {
      html += '<div class="response-editor"><label class="draft-label" for="response-draft">' + (approved ? 'Respuesta aprobada por soporte' : escalated ? 'Nota trasladada al equipo de soporte' : 'Revisa y edita el texto antes de continuar') + '</label><textarea id="response-draft" rows="9" maxlength="12000"' + (approved || escalated ? ' readonly' : '') + '>' + escape(run.draft) + '</textarea></div>';
      html += '<div class="response-actions"><span class="response-hint">' + icon('shield') + 'Sin envíos reales</span>';
      if (approved || escalated) html += '<button class="button secondary" data-action="copy">' + icon('copy') + 'Copiar respuesta</button>';
      else html += '<button class="button primary" data-action="' + (run.plan.needsHuman ? 'escalate' : 'approve') + '">' + icon(run.plan.needsHuman ? 'user' : 'check') + (run.plan.needsHuman ? 'Derivar a soporte' : 'Validar y guardar') + '</button>';
      html += '</div>';
      if (approved) html += '<div class="approval-note">' + (run.edited ? 'Corrección validada.' : 'Respuesta validada.') + ' Ticket actualizado en HubSpot simulado. Pulsa «Repetir caso» para ver cómo DB reutiliza esta solución.</div>';
      else if (escalated) html += '<div class="approval-note warning">Derivación registrada en el CRM simulado. Esta respuesta no se incorpora a la memoria de soluciones validadas.</div>';
      else if (run.plan.needsHuman) html += '<div class="approval-note warning">La información disponible no permite cerrar el caso. Revisa la nota y deriva a una persona.</div>';
    }
    $('#response-panel').innerHTML = html;
  }

  function availableEvidence(run) {
    if (!run) return {sources:[],api:[],history:[]};
    const completed = (agent) => run.plan.steps.findIndex((s) => s.agent === agent) < run.cursor;
    return {sources:completed('rag') ? run.plan.sources : [],api:completed('api') ? run.plan.apiCalls : [],history:completed('db') ? run.plan.similarTickets : []};
  }

  function renderEvidence() {
    const data = availableEvidence(currentRun());
    $('#evidence-count').textContent = data.sources.length + data.api.length + data.history.length;
    $$('[data-evidence]').forEach((button) => { button.setAttribute('aria-selected',String(button.dataset.evidence === evidenceTab)); button.tabIndex = button.dataset.evidence === evidenceTab ? 0 : -1; });
    $('#evidence-content').setAttribute('aria-labelledby','tab-' + evidenceTab);
    let items = '';
    if (evidenceTab === 'sources') items = data.sources.map((s) => '<article class="evidence-item"><div class="evidence-type">' + icon('file') + escape(s.id) + ' · FUENTE DEMO</div><h3>' + escape(s.title) + '</h3><p>' + escape(s.excerpt) + '</p><p>' + escape(s.source || '') + '</p></article>').join('');
    if (evidenceTab === 'api') items = data.api.map((call) => '<article class="evidence-item"><div class="api-line"><b>' + escape(call.method) + '</b><span>' + escape(call.path) + '</span></div><span class="api-status ' + (call.status >= 400 ? 'failed' : '') + '">' + escape(call.status) + ' · RESPUESTA SIMULADA</span><details><summary>Ver petición y respuesta</summary><pre>' + escape(JSON.stringify({request:call.request,response:call.response},null,2)) + '</pre></details></article>').join('');
    if (evidenceTab === 'history') items = data.history.map((h) => '<article class="evidence-item"><div class="evidence-type">' + icon('database') + escape(h.id) + '</div><h3>' + escape(h.title) + '</h3><p>Coincidencia demo: ' + escape(h.score) + '% · ' + (h.validated ? 'Validado' : 'Sin validar · no reutilizable') + '</p><details><summary>Ver solución anterior</summary><p>' + escape(h.solution) + '</p></details></article>').join('');
    const messages = {sources:['Documentación trazable','Los fragmentos consultados por RAG aparecerán aquí.'],api:['Datos que explican el diagnóstico','Las peticiones y respuestas simuladas aparecerán cuando intervenga API.'],history:['La experiencia del equipo','DB mostrará los casos similares y si su respuesta está validada.']};
    $('#evidence-content').innerHTML = items ? '<div class="evidence-list">' + items + (evidenceTab === 'history' ? '<p class="library-note">Coincidencia por palabras en la demo; no es una medida de confianza de IA.</p>' : '') + '</div>' : empty(evidenceTab === 'api' ? 'api' : evidenceTab === 'history' ? 'database' : 'book',messages[evidenceTab][0],isComplete(currentRun()) ? 'Este recorrido no ha necesitado evidencias de este tipo.' : messages[evidenceTab][1]);
  }

  function renderKnowledge() {
    const documents = E.initialData().knowledge;
    $('#knowledge-view').innerHTML = '<div class="library-head"><div><h2>Biblioteca de la demo</h2><p class="library-note">Fuentes ficticias que puedes inspeccionar en cada respuesta.</p></div>' + tag(documents.length + ' documentos','purple') + '</div><div class="library-grid">' + documents.map((doc) => '<article class="panel library-card"><span class="agent-icon">' + icon('book') + '</span>' + tag(doc.id,'purple') + '<h3>' + escape(doc.title) + '</h3><p>' + escape(doc.excerpt) + '</p><p>' + escape(doc.source) + '</p></article>').join('') + '</div><div class="library-head"><div><h2>Memoria de soluciones</h2><p class="library-note">Solo las soluciones validadas pueden reutilizarse en esta POC.</p></div>' + tag(state.history.filter((h) => h.validated).length + ' validadas','green') + '</div><div class="library-grid">' + state.history.map((h) => '<article class="panel library-card">' + tag(h.validated ? 'Validada' : 'Sin validar',h.validated ? 'green' : 'amber') + '<h3>' + escape(h.subject) + '</h3><p>' + escape(h.solution) + '</p><p>' + escape(h.id) + '</p></article>').join('') + '</div>';
  }

  function renderActivity() {
    $('#activity-view').innerHTML = '<div class="activity-head"><div><h2>Lo que ha ocurrido en esta sesión</h2><p class="library-note">Trazabilidad de ejecuciones, revisiones y acciones simuladas.</p></div>' + tag(state.activity.length + ' eventos','blue') + '</div><div class="panel activity-log">' + (state.activity.length ? state.activity.map((entry) => '<article class="activity-entry"><time datetime="' + escape(entry.time) + '">' + escape(new Date(entry.time).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',second:'2-digit'})) + '</time><span class="agent-icon">' + icon(entry.type) + '</span><div><h3>' + escape(entry.title) + '</h3><p>' + escape(entry.detail) + '</p></div></article>').join('') : empty('activity','Todavía no hay actividad','Resuelve el primer correo para ver el trabajo de los agentes y las decisiones de soporte.')) + '</div>';
  }

  function render() {
    renderMetrics(); renderInbox(); renderEmail(); renderAgents(); renderResponse(); renderEvidence();
    if (view === 'knowledge') renderKnowledge();
    if (view === 'activity') renderActivity();
  }

  function setView(next) {
    pause();
    view = next;
    const labels = {inbox:['Centro de agentes','Del correo a la solución','Tres agentes especializados. Una respuesta con contexto. Tú tienes la última palabra.'],knowledge:['Conocimiento','Cada respuesta tiene un origen','Explora las fuentes de RAG y las soluciones que el equipo ya ha validado.'],activity:['Actividad','Todo queda a la vista','Sigue las decisiones de los agentes y las acciones del equipo de soporte.']};
    $$('.view').forEach((el) => { el.hidden = el.id !== next + '-view'; });
    $$('[data-view]').forEach((button) => { button.classList.toggle('active',button.dataset.view === next); button.setAttribute('aria-current',button.dataset.view === next ? 'page' : 'false'); });
    $('#breadcrumb-view').textContent = labels[next][0];
    $('#page-title').innerHTML = labels[next][1] + '<span>.</span>';
    $('#page-subtitle').textContent = labels[next][2];
    render();
  }

  function pause() {
    clearTimeout(timer);
    timer = null;
    playingId = null;
  }

  function prepareRun() {
    const ticket = selected();
    const previous = state.runs[ticket.id];
    if (previous && !isComplete(previous)) return previous;
    const plan = E.plan(ticket,state.history);
    const run = {plan,cursor:0,status:'paused',draft:plan.response,edited:false};
    state.runs[ticket.id] = run;
    log('Ejecución iniciada',ticket.id + ' · ' + ticket.subject,'play');
    persist();
    return run;
  }

  function advance() {
    const ticket = selected();
    const run = state.runs[ticket.id];
    if (!run || isComplete(run)) return;
    const step = run.plan.steps[run.cursor];
    run.cursor += 1;
    log(step.title,ticket.id + ' · ' + step.detail,{db:'database',rag:'book',api:'api',manager:'activity'}[step.agent]);
    if (isComplete(run)) {
      pause();
      run.status = run.plan.needsHuman ? 'needs_human' : 'review';
      log(run.plan.needsHuman ? 'Requiere intervención humana' : 'Borrador listo para revisión',ticket.id + ' · ' + run.plan.summary,run.plan.needsHuman ? 'user' : 'mail');
      if (run.plan.route === 'known') evidenceTab = 'history';
      else if (run.plan.apiCalls.length) evidenceTab = 'api';
      else evidenceTab = 'sources';
    }
    persist();
    render();
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!playingId || playingId !== selected().id) return;
      advance();
      if (playingId) schedule();
    },speed);
  }

  function toggleRun() {
    if (playingId === selected().id) { pause(); renderAgents(); return; }
    prepareRun();
    playingId = selected().id;
    render();
    $('.agents-panel').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
    schedule();
  }

  function approve() {
    const run = currentRun();
    if (!isComplete(run) || run.status !== 'review' || run.plan.needsHuman) return;
    const text = run.draft.trim();
    if (!text) { toast('Añade una respuesta antes de validarla.'); $('#response-draft').focus(); return; }
    run.draft = text;
    run.edited = text !== run.plan.response.trim();
    state.history = E.learn(selected(),text,state.history);
    run.status = 'approved';
    run.validatedAt = new Date().toISOString();
    log(run.edited ? 'Respuesta corregida y validada' : 'Respuesta validada',selected().id + ' · Guardada en memoria y actualizada en HubSpot simulado. No se ha enviado ningún correo.','check');
    persist(); render();
    toast('Respuesta validada. Repite el caso para ver el aprendizaje de DB.');
  }

  function escalate() {
    const run = currentRun();
    if (!isComplete(run) || run.status !== 'needs_human') return;
    if (!run.draft.trim()) { toast('Añade una nota antes de derivar el caso.'); $('#response-draft').focus(); return; }
    run.status = 'escalated';
    log('Derivación a soporte registrada',selected().id + ' · CRM simulado. Sin añadir una solución no verificada a la memoria.','user');
    persist(); render(); toast('Caso derivado al equipo humano en el CRM simulado.');
  }

  async function copyResponse() {
    try { await navigator.clipboard.writeText(currentRun().draft); toast('Respuesta copiada.'); }
    catch (_) { $('#response-draft').focus(); $('#response-draft').select(); toast('Texto seleccionado. Pulsa Ctrl+C para copiarlo.'); }
  }

  function exportSession() {
    const exported = {application:'Support Studio POC',mode:'Simulación local. Datos ficticios. Sin integraciones reales.',exportedAt:new Date().toISOString(),...state};
    const blob = new Blob([JSON.stringify(exported,null,2)],{type:'application/json;charset=utf-8'});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'Support Studio-demo-' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url),1000);
    toast('Sesión exportada como JSON.');
  }

  function initialize() {
    state = loadState();
    hydrateIcons();
    render();
    $$('[data-view]').forEach((button) => button.addEventListener('click',() => setView(button.dataset.view)));
    $('.brand').addEventListener('click',(event) => { event.preventDefault(); setView('inbox'); });
    $('#ticket-search').addEventListener('input',renderInbox);
    $('#ticket-list').addEventListener('click',(event) => {
      const button = event.target.closest('[data-ticket]');
      if (!button || button.dataset.ticket === state.selectedId) return;
      pause(); state.selectedId = button.dataset.ticket; evidenceTab = 'sources'; persist(); render();
    });
    $('#run-btn').addEventListener('click',toggleRun);
    $('#step-btn').addEventListener('click',() => { pause(); prepareRun(); advance(); });
    $('#speed-select').addEventListener('change',(event) => { speed = Number(event.target.value); if (playingId) schedule(); });
    $('#response-panel').addEventListener('input',(event) => {
      if (event.target.id !== 'response-draft') return;
      const run = currentRun();
      if (run && ['review','needs_human'].includes(run.status)) { run.draft = event.target.value; persist(); }
    });
    $('#response-panel').addEventListener('click',(event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'approve') approve();
      if (action === 'escalate') escalate();
      if (action === 'copy') copyResponse();
    });
    $$('[data-evidence]').forEach((button) => {
      button.addEventListener('click',() => { evidenceTab = button.dataset.evidence; renderEvidence(); });
      button.addEventListener('keydown',(event) => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const names = ['sources','api','history'];
        const index = names.indexOf(evidenceTab);
        evidenceTab = names[event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3];
        renderEvidence(); $('#tab-' + evidenceTab).focus();
      });
    });
    $('#guide-btn').addEventListener('click',() => { pause(); renderAgents(); $('#guide-dialog').showModal(); });
    $('#start-guide-btn').addEventListener('click',() => { $('#guide-dialog').close(); setView('inbox'); $('#run-btn').focus(); });
    $('#new-ticket-btn').addEventListener('click',() => { pause(); renderAgents(); $('#new-dialog').showModal(); });
    $$('[data-close]').forEach((button) => button.addEventListener('click',() => $('#' + button.dataset.close).close()));
    $('#new-ticket-form').addEventListener('submit',(event) => {
      event.preventDefault();
      const form = event.target;
      const subject = form.elements.subject.value.trim();
      const body = form.elements.body.value.trim();
      if (!subject || body.length < 10) { toast('Escribe un asunto y un mensaje de al menos 10 caracteres.'); return; }
      const id = 'DEMO-' + state.nextId++;
      state.tickets.unshift({id,subject,body,sender:'Cliente de prueba',company:'Empresa demo · ficticia',initials:'CP',time:'Ahora',category:'Consulta personalizada',priority:'Media',scenario:'custom'});
      state.selectedId = id; $('#ticket-search').value = '';
      log('Correo de prueba añadido',id + ' · ' + subject,'mail');
      persist(); form.reset(); $('#new-dialog').close(); evidenceTab = 'sources'; render();
      toast('Correo añadido. Ya puedes resolverlo con los agentes.');
    });
    $('#reset-btn').addEventListener('click',() => { pause(); renderAgents(); $('#reset-dialog').showModal(); });
    $('#confirm-reset-btn').addEventListener('click',() => {
      pause(); state = freshState(); evidenceTab = 'sources'; $('#ticket-search').value = ''; $('#trace-details').open = false;
      persist(); $('#reset-dialog').close(); setView('inbox'); toast('Demo reiniciada. Lista para una nueva presentación.');
    });
    $('#export-btn').addEventListener('click',exportSession);
    window.addEventListener('beforeunload',persist);
    if (!storageAvailable) toast('Almacenamiento no disponible. La demo funcionará durante esta sesión.');
  }

  if (!E) {
    document.querySelector('main').innerHTML = '<div class="panel library-card"><h1>No se pudo cargar la demo</h1><p>Conserva juntos index.html, engine.js, app.js y styles.css dentro de la carpeta dist.</p></div>';
    return;
  }
  initialize();
}());
