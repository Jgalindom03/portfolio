(() => {
  const content = window.PORTFOLIO_CONTENT;
  const root = document.getElementById("portfolio-content");
  const languageButton = document.getElementById("language-toggle");
  const navigation = document.getElementById("site-navigation");
  if (!content || !root || !languageButton || !navigation) return;

  let locale = "en";
  let selectedFilter = "all";
  let selectedVoice = "appointment";

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[character]);

  const icon = (name, className = "") => {
    const shared = `class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"`;
    if (name === "arrow") return `<svg ${shared}><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    if (name === "external") return `<svg ${shared}><path d="M14 4h6v6m0-6-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return "";
  };

  const tags = (items, className = "tag-list") => `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

  const workflowSteps = {
    en: {
      "azure-agents": [["Request", "A synthetic question resembles another request but needs different context."], ["Route", "An orchestrator selects a specialist and retrieves relevant evidence."], ["Check", "The draft is compared with its evidence before it is shown."]],
      "voice-agents": [["Listen", "The scripted caller asks to make an appointment or service request."], ["Understand", "The flow collects intent and the few details needed for the task."], ["Hand off", "A confirmation-ready summary is prepared for the calendar or team."]],
      whatsapp: [["Message", "A synthetic WhatsApp question enters the support inbox."], ["Find context", "The workflow looks up the relevant answer and keeps the conversation context."], ["Escalate", "A person can review the draft with the conversation attached."]],
      "travel-rag": [["Request", "A synthetic trip request names a destination and a few preferences."], ["Specialists", "Travel, stay and activity agents gather options through shared state."], ["Confirm", "The assistant presents a draft itinerary and waits before sensitive actions."]],
      "ticket-triage": [["Ticket", "A fictional support request is captured with its key symptoms."], ["Retrieve", "Case history and guidance are gathered by separate specialist agents."], ["Review", "A grounded draft goes to a person for editing and validation."]],
      interviewer: [["Context", "A fixed interview profile stands in for candidate experience."], ["Question", "The practice flow chooses a focused question for that context."], ["Coach", "A sample response is followed by a reflection prompt and next step."]],
      "knowledge-rag": [["Question", "A synthetic operational question is entered."], ["Search", "Relevant passages are retrieved from an anonymized guide."], ["Answer", "A short response is paired with the context that supports it."]],
      "marine-cnn": [["Signal", "A fixed sensor trace is shown with a noisy test condition."], ["Classify", "The 1D CNN maps the signal to one of two classes."], ["Explain", "A saliency view highlights the input region used in the analysis."]]
    },
    es: {
      "azure-agents": [["Consulta", "Una pregunta sintética se parece a otra, pero necesita distinto contexto."], ["Enrutamiento", "El orquestador selecciona un agente y recupera evidencias pertinentes."], ["Revisión", "La respuesta propuesta se contrasta con sus evidencias."]],
      "voice-agents": [["Escuchar", "La persona del guion pide una cita o inicia una solicitud de servicio."], ["Entender", "El flujo recoge la intención y los datos necesarios para la tarea."], ["Derivar", "Prepara un resumen para confirmar con el calendario o el equipo."]],
      whatsapp: [["Mensaje", "Una consulta sintética de WhatsApp llega a la bandeja de soporte."], ["Buscar contexto", "El flujo localiza una respuesta pertinente y conserva el hilo."], ["Derivar", "Una persona puede revisar el borrador con la conversación adjunta."]],
      "travel-rag": [["Solicitud", "Una petición de viaje sintética indica destino y preferencias."], ["Especialistas", "Agentes de viaje, estancia y actividades reúnen opciones con estado compartido."], ["Confirmar", "El asistente presenta un itinerario y espera antes de acciones sensibles."]],
      "ticket-triage": [["Incidencia", "Se recoge una solicitud ficticia con los síntomas principales."], ["Recuperar", "Agentes distintos consultan casos anteriores y documentación."], ["Revisar", "Un borrador fundamentado pasa a una persona para editarlo y validarlo."]],
      interviewer: [["Contexto", "Un perfil de entrevista fijo representa la experiencia de quien practica."], ["Pregunta", "El flujo plantea una pregunta concreta para ese contexto."], ["Orientar", "Una respuesta de muestra da paso a una reflexión y al siguiente paso."]],
      "knowledge-rag": [["Pregunta", "Se introduce una consulta operativa sintética."], ["Buscar", "Se recuperan fragmentos pertinentes de una guía anonimizada."], ["Responder", "La respuesta breve se acompaña del contexto que la sustenta."]],
      "marine-cnn": [["Señal", "Se muestra una traza de sensor fija con una condición de ruido."], ["Clasificar", "La CNN 1D asigna la señal a una de dos clases."], ["Explicar", "Una vista de saliencia resalta la zona analizada de la entrada."]]
    }
  };

  function workflowPreview(project) {
    const steps = workflowSteps[locale]?.[project.id];
    if (!steps) return "";
    const previewTitle = locale === "en" ? "Local walkthrough · synthetic example" : "Recorrido local · ejemplo sintético";
    const nextLabel = locale === "en" ? "Next step" : "Siguiente paso";
    const stepLabel = locale === "en" ? "Step" : "Paso";
    return `<div class="workflow-preview" data-workflow-preview="${escapeHtml(project.id)}" data-step="0">
      <div class="workflow-preview-head"><span>${escapeHtml(previewTitle)}</span><span class="workflow-offline"><i aria-hidden="true"></i> ${locale === "en" ? "No API" : "Sin API"}</span></div>
      <ol class="workflow-rail" aria-label="${escapeHtml(locale === "en" ? "Workflow stages" : "Etapas del flujo")}">${steps.map(([stage], index) => `<li ${index === 0 ? 'aria-current="step"' : ""}><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(stage)}</li>`).join("")}</ol>
      <div class="workflow-readout"><span class="workflow-step-label">${escapeHtml(stepLabel)} 1 / 3</span><strong data-workflow-stage>${escapeHtml(steps[0][0])}</strong><p data-workflow-copy>${escapeHtml(steps[0][1])}</p></div>
      <div class="workflow-controls"><span data-workflow-status role="status" aria-live="polite">1 / 3</span><button type="button" data-workflow-next>${escapeHtml(nextLabel)}${icon("arrow")}</button></div>
    </div>`;
  }

  function renderNavigation(data) {
    navigation.innerHTML = `<div class="nav-links">${data.nav.map(([id, label]) => `<a href="#${escapeHtml(id)}">${escapeHtml(label)}</a>`).join("")}</div>`;
  }

  function traceMarkup(data) {
    return `<div class="trace-panel">
      <div class="trace-topline"><span class="trace-led" aria-hidden="true"></span><span>${escapeHtml(data.traceLabel)}</span><span class="trace-path">DISCOVERY / DELIVERY</span></div>
      <svg class="trace-graphic" viewBox="0 0 620 248" role="img" aria-labelledby="trace-title trace-desc">
        <title id="trace-title">${escapeHtml(data.traceLabel)}</title>
        <desc id="trace-desc">${data.traceSteps.map((step) => escapeHtml(step[1])).join(" → ")}</desc>
        <path class="trace-line trace-line-back" d="M32 170h133l46-92h120l58 104h199"/>
        <path class="trace-line trace-line-main" d="M32 170h133l46-92h120l58 104h199"/>
        <path class="trace-line trace-line-vertical" d="M165 170v40m46-132V36m120 42V36m58 106v68"/>
        <circle class="trace-node" cx="32" cy="170" r="7"/><circle class="trace-node" cx="165" cy="170" r="7"/>
        <circle class="trace-node trace-node-active" cx="211" cy="78" r="9"/><circle class="trace-node" cx="331" cy="78" r="7"/>
        <circle class="trace-node" cx="389" cy="182" r="7"/><circle class="trace-node" cx="589" cy="182" r="7"/>
        <path class="trace-tick" d="M32 170h31m102 0h34m12-92h48m72 0h32m61 104h44m65 0h88"/>
      </svg>
      <ol class="trace-steps">${data.traceSteps.map(([number, title, note], index) => `<li class="${index === 1 ? "is-current" : ""}"><span class="trace-number">${escapeHtml(number)}</span><span class="trace-name">${escapeHtml(title)}</span><span class="trace-note">${escapeHtml(note)}</span></li>`).join("")}</ol>
    </div>`;
  }

  function renderExperience(data) {
    return `<section class="section experience-section" id="experience" aria-labelledby="experience-title">
      <div class="section-heading"><p class="section-eyebrow">${escapeHtml(data.experienceEyebrow)}</p><h2 id="experience-title">${escapeHtml(data.experienceTitle)}</h2><p class="section-intro">${escapeHtml(data.experienceIntro)}</p></div>
      <article class="bank-feature">
        <div class="bank-copy"><p class="feature-label"><span class="feature-pulse" aria-hidden="true"></span>${escapeHtml(data.bankLabel)}</p><h3>${escapeHtml(data.bankTitle)}</h3><p>${escapeHtml(data.bankCopy)}</p></div>
        <div class="bank-result"><span class="result-mark" aria-hidden="true">↗</span><p class="result-label">${escapeHtml(data.bankOutcomeLabel)}</p><p>${escapeHtml(data.bankOutcome)}</p></div>
      </article>
      <ol class="experience-list">${data.experience.map((item, index) => `<li class="experience-item"><div class="experience-date">${escapeHtml(item.period)}</div><div class="experience-marker" aria-hidden="true"><span>${String(index + 1).padStart(2, "0")}</span></div><div class="experience-body"><div class="experience-title-row"><h3>${escapeHtml(item.company)}</h3><p>${escapeHtml(item.role)}</p></div><p class="experience-description">${escapeHtml(item.body)}</p></div></li>`).join("")}</ol>
    </section>`;
  }

  function voiceDemo(data) {
    const scenario = data.voiceScenarios.find((item) => item.id === selectedVoice) || data.voiceScenarios[0];
    return `<div class="voice-demo" id="voice-demo">
      <div class="voice-demo-head"><div><p class="demo-kicker">${escapeHtml(data.noAudioLabel)}</p><h4>${escapeHtml(data.voiceHeading)}</h4><p>${escapeHtml(data.voiceIntro)}</p></div><span class="offline-mark"><span aria-hidden="true"></span>Offline demo</span></div>
      <div class="voice-scenarios" role="group" aria-label="${escapeHtml(data.voiceHeading)}">${data.voiceScenarios.map((item) => `<button type="button" class="scenario-button ${item.id === scenario.id ? "is-selected" : ""}" data-voice="${escapeHtml(item.id)}" aria-pressed="${item.id === scenario.id}">${escapeHtml(item.name)}</button>`).join("")}</div>
      <div class="voice-transcript" aria-live="polite" aria-atomic="false"><div class="transcript-topline"><span>${escapeHtml(scenario.name)}</span><span class="script-badge">${escapeHtml(data.noAudioLabel)}</span></div><ol>${scenario.turns.map(([role, line]) => `<li class="transcript-turn ${role === "assistant" ? "turn-assistant" : "turn-caller"}"><span class="turn-role">${escapeHtml(role === "assistant" ? data.assistantLabel : data.callerLabel)}</span><p>${escapeHtml(line)}</p></li>`).join("")}</ol></div>
    </div>`;
  }

  function whatsappDemo(data) {
    return `<div class="message-preview"><div class="message-preview-top"><span class="message-avatar" aria-hidden="true">JG</span><span><strong>Service desk</strong><small>${escapeHtml(data.messageHandoff)}</small></span><span class="message-status" aria-label="${escapeHtml(data.messageHandoff)}">●</span></div><div class="message-thread"><p class="message-bubble message-in">${escapeHtml(data.messageUser)}</p><p class="message-bubble message-out">${escapeHtml(data.messageBot)}</p></div></div>`;
  }

  function projectExtra(project, data) {
    const workflow = workflowPreview(project);
    if (project.id === "azure-agents") return `<div class="agent-map" role="img" aria-label="${escapeHtml(locale === "en" ? "Conceptual diagram: similar requests pass through an orchestrator to five specialized agents, then through evaluation." : "Diagrama conceptual: las consultas parecidas pasan por un orquestador a cinco agentes especializados y después por una evaluación.")}"><p class="map-label">${escapeHtml(locale === "en" ? "Conceptual architecture · anonymized" : "Arquitectura conceptual · anonimizada")}</p><div class="map-source">${escapeHtml(locale === "en" ? "Similar requests" : "Consultas parecidas")}</div><div class="map-connectors" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div><div class="map-agents">${Array.from({ length: 5 }, (_, index) => `<span>${escapeHtml(locale === "en" ? "Specialist" : "Agente especializado")} ${index + 1}</span>`).join("")}</div><div class="map-output">${escapeHtml(locale === "en" ? "Evaluation & answer" : "Evaluación y respuesta")}</div></div>${workflow}`;
    if (project.id === "voice-agents") return `${voiceDemo(data)}${workflow}`;
    if (project.id === "whatsapp") return `${whatsappDemo(data)}${workflow}`;
    return workflow;
  }

  function projectArtwork(project) {
    if (project.pocPreview) {
      return '<div class="project-art project-art-' + escapeHtml(project.id) + '" role="img" aria-label="' + escapeHtml(project.pocPreview.join(". ")) + '"><div class="mini-window"><div class="mini-windowbar"><span class="mini-window-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mini-window-title">' + escapeHtml(project.pocPreview[0]) + '</span><span class="mini-local-label">LOCAL DEMO</span></div><div class="mini-ui-body"><div class="mini-request"><span>WORKFLOW</span><strong>' + escapeHtml(project.pocPreview[1]) + '</strong></div><div class="mini-footnote">' + escapeHtml(project.pocPreview[2]) + '</div></div></div></div>';
    }
    const labels = {
      en: {
        demo: "LOCAL DEMO · SAMPLE DATA",
        accessible: "Static illustrative interface for " + project.title + ". Synthetic content; no live service.",
        router: "Request router",
        voice: "Voice booking",
        whatsapp: "WhatsApp support",
        support: "Support workspace",
        ticket: "Case review",
        interview: "Interview practice",
        knowledge: "Knowledge search",
        marine: "Signal diagnosis"
      },
      es: {
        demo: "DEMO LOCAL · DATOS FICTICIOS",
        accessible: "Interfaz ilustrativa de " + project.title + ". Contenido sintético; sin servicios conectados.",
        router: "Enrutador de consultas",
        voice: "Citas por voz",
        whatsapp: "Soporte por WhatsApp",
        support: "Bandeja de soporte",
        ticket: "Revisión de caso",
        interview: "Práctica de entrevista",
        knowledge: "Búsqueda documental",
        marine: "Diagnóstico de señal"
      }
    }[locale];
    const views = {
      "azure-agents": '<div class="mini-request"><span>' + (locale === "en" ? "INCOMING REQUEST" : "CONSULTA RECIBIDA") + '</span><strong>' + (locale === "en" ? "Similar question · new context" : "Pregunta similar · otro contexto") + '</strong></div><div class="mini-route"><b>' + (locale === "en" ? "Orchestrator" : "Orquestador") + '</b><i>→</i><b class="mini-highlight">' + (locale === "en" ? "Specialist" : "Especialista") + '</b><i>→</i><b>' + (locale === "en" ? "Evidence" : "Evidencia") + '</b></div><div class="mini-footnote">' + (locale === "en" ? "Route selected · review before answer" : "Ruta seleccionada · revisar respuesta") + '</div>',
      "voice-agents": '<div class="mini-voice-heading"><span class="mini-avatar">V</span><span><b>' + (locale === "en" ? "Appointment request" : "Solicitud de cita") + '</b><small>' + (locale === "en" ? "Voice assistant · sample" : "Agente de voz · ejemplo") + '</small></span><i class="mini-status-dot"></i></div><div class="mini-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="mini-confirmation"><b>' + (locale === "en" ? "Tuesday · 10:30" : "Martes · 10:30") + '</b><span>' + (locale === "en" ? "Ready for confirmation" : "Pendiente de confirmar") + '</span></div>',
      whatsapp: '<div class="mini-chat-row mini-chat-left"><span>' + (locale === "en" ? "Could I book a service?" : "¿Puedo pedir una cita?") + '</span></div><div class="mini-chat-row mini-chat-right"><span>' + (locale === "en" ? "Of course. Which day works for you?" : "Claro. ¿Qué día te viene bien?") + '</span></div><div class="mini-chat-footer"><i></i>' + (locale === "en" ? "Human handoff available" : "Derivación a una persona disponible") + '</div>',
      "travel-rag": '<div class="mini-inbox"><div class="mini-inbox-side"><i></i><i></i><i></i></div><div class="mini-inbox-main"><span class="mini-ticket-label">' + (locale === "en" ? "NEW QUESTION" : "NUEVA CONSULTA") + '</span><b>' + (locale === "en" ? "Help me plan a weekend away" : "Ayúdame a organizar una escapada") + '</b><div class="mini-agent-chips"><span>' + (locale === "en" ? "Stay" : "Alojamiento") + '</span><span>' + (locale === "en" ? "Activities" : "Actividades") + '</span><span>' + (locale === "en" ? "Review" : "Revisión") + '</span></div></div></div>',
      "ticket-triage": '<div class="mini-ticket-head"><span class="mini-ticket-icon">#</span><span><small>' + (locale === "en" ? "SAMPLE CASE" : "CASO DE EJEMPLO") + '</small><b>' + (locale === "en" ? "Access issue" : "Problema de acceso") + '</b></span><span class="mini-priority">' + (locale === "en" ? "Review" : "Revisar") + '</span></div><div class="mini-evidence"><span>' + (locale === "en" ? "Past resolution" : "Resolución anterior") + '</span><i></i><span>' + (locale === "en" ? "Guide match" : "Guía relacionada") + '</span><i></i></div><div class="mini-footnote">' + (locale === "en" ? "Draft reply · human approval" : "Respuesta propuesta · aprobación humana") + '</div>',
      interviewer: '<div class="mini-interview-top"><span class="mini-progress">' + (locale === "en" ? "QUESTION 02 / 06" : "PREGUNTA 02 / 06") + '</span><span class="mini-timer">02:14</span></div><strong class="mini-question">' + (locale === "en" ? "How would you evaluate an AI workflow?" : "¿Cómo evaluarías un flujo de IA?") + '</strong><div class="mini-answer">' + (locale === "en" ? "Your answer appears here…" : "Tu respuesta aparecería aquí…") + '</div><div class="mini-feedback"><span>' + (locale === "en" ? "Practice" : "Práctica") + '</span><i></i><span>' + (locale === "en" ? "Feedback" : "Feedback") + '</span><i></i><span>' + (locale === "en" ? "Next" : "Siguiente") + '</span></div>',
      "knowledge-rag": '<div class="mini-search"><i>⌕</i><span>' + (locale === "en" ? "Search a policy or procedure…" : "Buscar una política o procedimiento…") + '</span><b>↵</b></div><div class="mini-answer-card"><span class="mini-ticket-label">' + (locale === "en" ? "GROUNDED ANSWER" : "RESPUESTA CON FUENTES") + '</span><b>' + (locale === "en" ? "Based on the operations guide…" : "Según la guía operativa…") + '</b><small>' + (locale === "en" ? "Operations guide · section 4" : "Guía operativa · sección 4") + '</small></div>',
      "marine-cnn": '<div class="mini-signal-head"><span>' + (locale === "en" ? "MACHINE SIGNAL" : "SEÑAL DE MÁQUINA") + '</span><span>1D CNN</span></div><svg class="mini-signal-chart" viewBox="0 0 280 54" aria-hidden="true"><path d="M0 29 C12 28 14 14 28 18 S45 44 59 32 75 12 89 22 103 40 118 29 136 14 150 24 166 43 179 30 198 12 212 24 230 38 243 26 263 14 280 25"/><path class="mini-saliency" d="M165 8v39m16-39v39m16-39v39"/></svg><div class="mini-diagnosis"><b>' + (locale === "en" ? "Pattern detected" : "Patrón detectado") + '</b><span>' + (locale === "en" ? "Signal window highlighted" : "Ventana de señal resaltada") + '</span></div>'
    };
    const preview = views[project.id] || views["azure-agents"];
    const viewKey = project.id === "azure-agents" ? "router" : project.id === "voice-agents" ? "voice" : project.id === "whatsapp" ? "whatsapp" : project.id === "travel-rag" ? "support" : project.id === "ticket-triage" ? "ticket" : project.id === "interviewer" ? "interview" : project.id === "knowledge-rag" ? "knowledge" : "marine";
    return '<div class="project-art project-art-' + escapeHtml(project.id) + '" role="img" aria-label="' + escapeHtml(labels.accessible) + '"><div class="mini-window"><div class="mini-windowbar"><span class="mini-window-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mini-window-title">' + escapeHtml(labels[viewKey]) + '</span><span class="mini-local-label">' + escapeHtml(labels.demo) + '</span></div><div class="mini-ui-body">' + preview + '</div></div></div>';
  }
  function projectCard(project, data) {
    const category = project.category === "professional" ? data.projectTypes.professional : data.projectTypes.independent;
    return `<article class="project-card project-card-${escapeHtml(project.id)}" data-category="${escapeHtml(project.category)}">
      ${projectArtwork(project)}<div class="project-content"><div class="project-card-heading"><span class="project-category">${escapeHtml(category)}</span><button type="button" class="poc-launch" data-open-poc="${escapeHtml(project.id)}">${locale === "en" ? "Try demo ↗" : "Probar demo ↗"}</button></div>
      <h3>${escapeHtml(project.title)}</h3><p class="project-summary">${escapeHtml(project.summary)}</p>${tags(project.technologies, "tag-list project-tech-preview")}
      <details class="case-details"><summary><span>${escapeHtml(locale === "en" ? "Scope, approach & results" : "Alcance, enfoque y resultados")}</span>${icon("arrow", "summary-arrow")}</summary>
        <div class="case-body"><dl><div><dt>${locale === "en" ? "Challenge" : "Reto"}</dt><dd>${escapeHtml(project.problem)}</dd></div><div><dt>${locale === "en" ? "Approach" : "Enfoque"}</dt><dd>${escapeHtml(project.approach)}</dd></div><div><dt>${locale === "en" ? "Outcome" : "Resultado"}</dt><dd>${escapeHtml(project.result)}</dd></div></dl>
          <p class="technology-label">${locale === "en" ? "Technology" : "Tecnologías"}</p>${tags(project.technologies, "tag-list case-tags")}<p class="demo-caption"><span class="demo-icon" aria-hidden="true">◌</span>${escapeHtml(project.demo)}</p>
          ${projectExtra(project, data)}
        </div>
      </details></div>
    </article>`;
  }

  function renderProjects(data) {
    return `<section class="section work-section" id="work" aria-labelledby="work-title">
      <div class="section-heading section-heading-wide"><div><p class="section-eyebrow">${escapeHtml(data.workEyebrow)}</p><h2 id="work-title">${escapeHtml(data.workTitle)}</h2></div><p class="section-intro">${escapeHtml(data.workIntro)}</p></div>
      <div class="project-toolbar"><div class="filter-group" role="group" aria-label="${locale === "en" ? "Filter projects" : "Filtrar proyectos"}"><button class="filter-button is-active" data-filter="all" aria-pressed="true" type="button">${escapeHtml(data.filters.all)}</button><button class="filter-button" data-filter="professional" aria-pressed="false" type="button">${escapeHtml(data.filters.professional)}</button><button class="filter-button" data-filter="independent" aria-pressed="false" type="button">${escapeHtml(data.filters.independent)}</button></div><p class="filter-status" role="status" aria-live="polite"></p></div>
      <div class="project-grid">${data.projects.map((project) => projectCard(project, data)).join("")}</div>
    </section>`;
  }

  function renderResults(data) {
    const label = locale === "en" ? "Accuracy on test set" : "Acierto en prueba";
    return `<section class="results-section" aria-labelledby="results-title"><div class="results-copy"><p class="section-eyebrow">${escapeHtml(locale === "en" ? "Measured result" : "Resultado medido")}</p><h2 id="results-title">${escapeHtml(data.metricTitle)}</h2><p>${escapeHtml(data.metricCopy)}</p><p class="result-caveat">${escapeHtml(data.metricNote)}</p></div>
      <div class="results-chart" role="img" aria-label="${escapeHtml(`${label}: ${data.metricBaseline} 98.75 percent; ${data.metricNoisy} 98.25 percent.`)}">
        <div class="chart-heading"><span>${escapeHtml(locale === "en" ? "Reported accuracy" : "Acierto reportado")}</span><span>${escapeHtml(locale === "en" ? "Test results" : "Resultados de prueba")}</span></div>
        <div class="metric-row"><div class="metric-label"><span>${escapeHtml(data.metricBaseline)}</span><strong>98.75%</strong></div><div class="metric-track"><span style="--metric-width:98.75%"></span></div></div>
        <div class="metric-row"><div class="metric-label"><span>${escapeHtml(data.metricNoisy)}</span><strong>98.25%</strong></div><div class="metric-track"><span style="--metric-width:98.25%"></span></div></div>
        <p class="chart-footnote">${escapeHtml(locale === "en" ? "Binary classification · 400 held-out samples" : "Clasificación binaria · 400 muestras reservadas")}</p>
      </div>
    </section>`;
  }

  function issuerMark(certificate) {
    if (["langchain", "sololearn"].includes(certificate.icon)) {
      return `<img class="issuer-image" src="assets/issuers/${escapeHtml(certificate.icon)}.svg" alt="" loading="lazy">`;
    }
    if (certificate.icon === "azure") return `<span class="issuer-ms-grid" aria-hidden="true"><i></i><i></i><i></i><i></i></span>`;
    if (certificate.icon === "deeplearning") return `<span class="issuer-dlai-mark" aria-hidden="true"><i></i><i></i><i></i></span>`;
    return `<span class="issuer-wordmark issuer-aws" aria-hidden="true">aws<i></i></span>`;
  }

  function renderCertificates(data) {
    const badgeAction = locale === "en" ? "Verify on Credly" : "Verificar en Credly";
    return `<section class="section certification-section" id="certifications" aria-labelledby="certifications-title"><div class="section-heading section-heading-wide"><div><p class="section-eyebrow">${escapeHtml(data.certEyebrow)}</p><h2 id="certifications-title">${escapeHtml(data.certTitle)}</h2></div><p class="section-intro">${escapeHtml(data.certIntro)}</p></div>
      <ul class="verified-badge-grid">${data.verifiedBadges.map((badge) => `<li><a class="verified-badge-card" href="${escapeHtml(badge.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(badge.name)} — ${escapeHtml(badgeAction)}"><span class="verified-badge-art"><img src="${escapeHtml(badge.image)}" alt="" loading="lazy"></span><span class="verified-badge-copy"><strong>${escapeHtml(badge.name)}</strong><small>${escapeHtml(badge.issuer)}</small><time>${escapeHtml(badge.date)}</time></span><span class="verified-badge-link">${escapeHtml(badgeAction)}${icon("arrow")}</span></a></li>`).join("")}</ul>
      <p class="credly-profile-link"><a href="${escapeHtml(data.certProfileUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.certProfileLabel)}${icon("arrow")}</a></p>
      <div class="additional-certificates"><div class="additional-certificates-heading"><h3>${escapeHtml(data.additionalCertTitle)}</h3><p>${escapeHtml(data.additionalCertIntro)}</p></div><ul class="certificate-list">${data.certificates.map((certificate) => `<li class="certificate-item"><span class="issuer-box">${issuerMark(certificate)}</span><span class="certificate-name">${escapeHtml(certificate.name)}<small class="issuer-line">${escapeHtml(certificate.issuer)}</small></span><time>${escapeHtml(certificate.date)}</time></li>`).join("")}</ul></div>
    </section>`;
  }

  function renderToolkit(data) {
    return `<section class="section toolkit-section" id="toolkit" aria-labelledby="toolkit-title"><div class="section-heading"><p class="section-eyebrow">${escapeHtml(data.toolkitEyebrow)}</p><h2 id="toolkit-title">${escapeHtml(data.toolkitTitle)}</h2><p class="section-intro">${escapeHtml(data.toolkitIntro)}</p></div>
      <div class="toolkit-groups">${data.toolkit.map(([heading, items]) => `<article class="toolkit-group"><span class="toolkit-index" aria-hidden="true"></span><div><h3>${escapeHtml(heading)}</h3>${tags(items, "tag-list toolkit-tags")}</div></article>`).join("")}</div>
    </section>`;
  }

  function renderEducation(data) {
    return `<section class="foundation-section" aria-labelledby="education-title"><div><p class="section-eyebrow">${escapeHtml(data.educationEyebrow)}</p><h2 id="education-title">${escapeHtml(data.educationTitle)}</h2></div><div class="foundation-details"><div><h3>${escapeHtml(data.degree)}</h3><p>${escapeHtml(data.university)}</p><time>${escapeHtml(data.studyPeriod)}</time></div><div class="language-details"><h3>${escapeHtml(data.languagesTitle)}</h3><ul>${data.languages.map(([name, level]) => `<li><span>${escapeHtml(name)}</span><span>${escapeHtml(level)}</span></li>`).join("")}</ul></div></div></section>`;
  }

  function render(data) {
    document.documentElement.lang = data.lang;
    document.title = data.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = data.description;
    languageButton.textContent = locale === "en" ? "ES" : "EN";
    languageButton.setAttribute("aria-label", locale === "en" ? "Cambiar idioma a español" : "Switch language to English");
    languageButton.title = locale === "en" ? "Cambiar idioma a español" : "Switch language to English";
    renderNavigation(data);
    document.querySelector('[data-label="contactNav"]').textContent = data.contactNav;
    document.querySelector('[data-label="backTop"]').textContent = data.backTop;

    root.innerHTML = `<section class="hero-section" id="top" aria-labelledby="hero-title">
      <div class="hero-copy"><p class="hero-eyebrow"><span class="availability-dot" aria-hidden="true"></span>${escapeHtml(data.eyebrow)}</p><h1 id="hero-title">${escapeHtml(data.heroTitle)}</h1><p class="hero-intro">${escapeHtml(data.heroIntro)}</p>
        <p class="current-focus"><span class="focus-rule" aria-hidden="true"></span>${escapeHtml(data.heroCurrent)}</p>
        <div class="hero-actions"><a class="button button-primary" href="#work">${escapeHtml(data.heroPrimary)}${icon("arrow")}</a><a class="text-link" href="#contact">${escapeHtml(data.heroSecondary)}${icon("external")}</a></div>
        <p class="hero-note">${escapeHtml(data.heroNote)}</p></div>
      <div class="hero-visual">${traceMarkup(data)}</div>
      <div class="hero-footline"><span>01 / 04</span><span>${escapeHtml(locale === "en" ? "A practice built around delivery" : "Una práctica orientada a la entrega")}</span><a href="#profile" aria-label="${escapeHtml(locale === "en" ? "Continue to profile" : "Ir al perfil")}">↓</a></div>
    </section>
    <section class="proof-strip" aria-label="${escapeHtml(locale === "en" ? "Portfolio at a glance" : "El portfolio en cifras")}"><div><strong>3</strong><span>${escapeHtml(locale === "en" ? "employers" : "empresas")}</span></div><div><strong>${data.projects.length}</strong><span>${escapeHtml(locale === "en" ? "selected builds" : "proyectos seleccionados")}</span></div><div><strong>${data.verifiedBadges.length + data.certificates.length}</strong><span>${escapeHtml(locale === "en" ? "credentials & courses" : "credenciales y cursos")}</span></div><a href="#experience">${escapeHtml(locale === "en" ? "Explore the work" : "Ver trayectoria")}${icon("arrow")}</a></section>
    <section class="section profile-section" id="profile" aria-labelledby="profile-title"><div class="section-heading"><p class="section-eyebrow">${escapeHtml(data.profileEyebrow)}</p><h2 id="profile-title">${escapeHtml(data.profileTitle)}</h2></div><div class="profile-content"><p class="profile-lead">${escapeHtml(data.profileLead)}</p><p class="profile-copy">${escapeHtml(data.profileCopy)}</p><div class="profile-pillars">${data.profilePillars.map(([title, body]) => `<article><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`).join("")}</div></div></section>
    ${renderExperience(data)}
    ${renderProjects(data)}
    ${renderResults(data)}
    ${renderCertificates(data)}
    ${renderToolkit(data)}
    ${renderEducation(data)}
    <section class="contact-section" id="contact" aria-labelledby="contact-title"><div><p class="section-eyebrow">${escapeHtml(data.contactEyebrow)}</p><h2 id="contact-title">${escapeHtml(data.contactTitle)}</h2><p>${escapeHtml(data.contactCopy)}</p></div><div class="contact-links"><a href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=jgalindom2003%40gmail.com" target="_blank" rel="noopener noreferrer" class="contact-link">${escapeHtml(data.emailLabel)}${icon("arrow")}</a><a href="https://www.linkedin.com/in/javiergalindomartinez" target="_blank" rel="noopener noreferrer" class="contact-link">${escapeHtml(data.linkedinLabel)}${icon("external")}</a></div><p class="confidentiality-note">${escapeHtml(data.confidentiality)}</p></section>`;
    document.querySelector("[data-footer-note]").textContent = data.footer;
    applyFilter();
  }

  function applyFilter() {
    const cards = [...root.querySelectorAll(".project-card")];
    cards.forEach((card) => { card.hidden = selectedFilter !== "all" && card.dataset.category !== selectedFilter; });
    root.querySelectorAll(".filter-button").forEach((button) => {
      const active = button.dataset.filter === selectedFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const status = root.querySelector(".filter-status");
    const visibleCount = cards.filter((card) => !card.hidden).length;
    if (status) status.textContent = locale === "en" ? `${visibleCount} projects shown` : `${visibleCount} proyectos visibles`;
  }

  document.addEventListener("click", (event) => {
    const filterButton = event.target.closest("[data-filter]");
    if (filterButton) {
      selectedFilter = filterButton.dataset.filter;
      applyFilter();
      return;
    }
    const workflowButton = event.target.closest("[data-workflow-next]");
    if (workflowButton) {
      const preview = workflowButton.closest("[data-workflow-preview]");
      const steps = workflowSteps[locale]?.[preview?.dataset.workflowPreview];
      if (!preview || !steps) return;
      const nextStep = (Number(preview.dataset.step) + 1) % steps.length;
      preview.dataset.step = String(nextStep);
      const [stage, copy] = steps[nextStep];
      preview.querySelector("[data-workflow-stage]").textContent = stage;
      preview.querySelector("[data-workflow-copy]").textContent = copy;
      preview.querySelector(".workflow-step-label").textContent = `${locale === "en" ? "Step" : "Paso"} ${nextStep + 1} / ${steps.length}`;
      preview.querySelector("[data-workflow-status]").textContent = `${locale === "en" ? "Step" : "Paso"} ${nextStep + 1} of ${steps.length}: ${stage}. ${copy}`;
      preview.querySelectorAll(".workflow-rail li").forEach((item, index) => {
        if (index === nextStep) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
      return;
    }
    const voiceButton = event.target.closest("[data-voice]");
    if (voiceButton) {
      selectedVoice = voiceButton.dataset.voice;
      render(content[locale]);
      const voiceDemoNode = document.getElementById("voice-demo");
      voiceDemoNode?.closest("details")?.setAttribute("open", "");
      const nextVoiceButton = [...root.querySelectorAll("[data-voice]")].find((button) => button.dataset.voice === selectedVoice);
      nextVoiceButton?.focus({ preventScroll: true });
      voiceDemoNode?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  });

  languageButton.addEventListener("click", () => {
    locale = locale === "en" ? "es" : "en";
    render(content[locale]);
  });

  render(content[locale]);
})();
