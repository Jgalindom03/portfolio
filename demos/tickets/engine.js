/*
 * Support Studio POC: deterministic, dependency-free simulation with invented data.
 * No requests, credentials, customer data, embeddings or LLM calls are used.
 * The original Manager.py selects Agent_DB or Agent_RAG; Agent_API is a
 * separate assistant. Coordinating all three here is a proposed demo extension.
 * Similarity percentages are lexical demo scores, not model confidence.
 * Requiring validation before reuse is a proposed guardrail: the current Python
 * similarity lookup does not apply this validation filter.
 */
(function (root, factory) {
  'use strict';
  var engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.PocEngine = engine;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var STOP_WORDS = new Set(('a al algo ante como con cual cuando de del desde donde el ella en entre es esta estamos este esto fue ha hay he hola la las le les lo los me mi mis muy no nos nuestra nuestro o para pero por porque puede puedo que qué se sin sobre su sus te tengo tiene tu un una unos unas y ya necesito favor buenos dias gracias re').split(' '));
  var ALIASES = {
    claves: 'contrasena', clave: 'contrasena', contrasenas: 'contrasena', password: 'contrasena',
    recuperar: 'recuperar', recuperacion: 'recuperar', restablecer: 'recuperar', restablecimiento: 'recuperar', resetear: 'recuperar',
    acceder: 'acceso', entrar: 'acceso', iniciar: 'acceso',
    alertas: 'alerta', notificaciones: 'notificacion', avisos: 'alerta',
    vehiculos: 'vehiculo', geocercas: 'geocerca', geofencing: 'geocerca', geofence: 'geocerca',
    rutas: 'ruta', correos: 'correo', cuentas: 'cuenta'
  };

  function normalize(value) {
    return String(value == null ? '' : value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function keywords(value) {
    return Array.from(new Set(normalize(value).split(' ').filter(function (word) {
      return word.length > 2 && !STOP_WORDS.has(word);
    }).map(function (word) { return ALIASES[word] || word; })));
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  var KNOWLEDGE = [
    {
      id: 'DOC-01', title: 'Alertas de velocidad: configuración y diagnóstico',
      source: 'Guía de soporte demo · § 4.2',
      excerpt: 'Una alerta de velocidad requiere speed.enabled=true, un umbral configurado y un canal habilitado. Revisar la configuración del vehículo antes de proponer cambios. Una ruta con velocidad superior al umbral no prueba que se haya enviado una notificación.'
    },
    {
      id: 'DOC-02', title: 'Consulta de vehículos, notificaciones y rutas',
      source: 'Referencia API demo · v1 / v2',
      excerpt: 'Consultar GET /dev/v1/vehicles por deviceId; usar el vehicleId devuelto para obtener el vehículo, /notifications/settings y GET /dev/v2/vehicles/{vehicleId}/routes. Estas consultas son de lectura; no modifican la configuración.'
    },
    {
      id: 'DOC-03', title: 'Crear una geocerca y activar avisos',
      source: 'Manual de usuario demo · § 6.1',
      excerpt: 'En el panel demo: Geocercas > Nueva geocerca, dibujar el perímetro, asignar un nombre y guardar. Asociar los vehículos y activar los eventos de entrada y/o salida. Seleccionar el canal de aviso y comprobarlo con un recorrido de prueba.'
    },
    {
      id: 'DOC-04', title: 'Recuperación del acceso a una cuenta',
      source: 'Manual de usuario demo · § 1.3',
      excerpt: 'En la pantalla de acceso seleccionar «He olvidado mi contraseña», introducir el correo de la cuenta y abrir el enlace recibido. Revisar spam si no aparece. Si continúa el problema, soporte verifica la cuenta sin solicitar la contraseña.'
    },
    {
      id: 'DOC-05', title: 'Protocolo ante una API no disponible',
      source: 'Procedimiento de soporte demo · § 8.2',
      excerpt: 'Si una consulta devuelve 503, detener la cadena, conservar el código y el identificador de seguimiento, y escalar a soporte. No concluir que el vehículo está desconectado ni que se han perdido rutas sin una respuesta válida.'
    }
  ];

  var PASSWORD_SOLUTION = 'Hola, puedes recuperar el acceso desde «He olvidado mi contraseña» en la pantalla de inicio de sesión. Introduce el correo asociado a tu cuenta y sigue el enlace que recibirás. Revisa la carpeta de spam si no aparece. Si el correo no llega, contacta con soporte para verificar la cuenta; no compartas tu contraseña.';

  var FIXTURES = {
    tickets: [
      {
        id: 'DEMO-1042', subject: 'No llegan las alertas de velocidad',
        body: 'Hola, nuestro vehículo demo LL-204 supera los 90 km/h durante las rutas, pero no recibimos alertas de velocidad. El dispositivo es DEMO-DEVICE-204. ¿Podéis revisar la configuración y explicar qué ocurre?',
        sender: 'Usuario demo 01', company: 'Cuenta demo · ficticia', initials: 'UD', time: 'Hace 4 min', category: 'Notificaciones', priority: 'Alta', scenario: 'combined'
      },
      {
        id: 'DEMO-1041', subject: 'Recuperar la contraseña de mi cuenta',
        body: 'He olvidado la contraseña y no puedo acceder a mi cuenta. Necesito recuperar el acceso al panel.',
        sender: 'Usuario demo 02', company: 'Cuenta demo · ficticia', initials: 'UD', time: 'Hace 12 min', category: 'Acceso', priority: 'Media', scenario: 'known'
      },
      {
        id: 'DEMO-1040', subject: 'Cómo crear una geocerca para el almacén',
        body: 'Quiero crear una geocerca alrededor del almacén y recibir un aviso cuando nuestros vehículos entren o salgan. ¿Qué pasos debo seguir?',
        sender: 'Usuario demo 03', company: 'Cuenta demo · ficticia', initials: 'UD', time: 'Hace 25 min', category: 'Geocercas', priority: 'Media', scenario: 'rag'
      },
      {
        id: 'DEMO-1039', subject: 'No puedo consultar las rutas del vehículo',
        body: 'Al consultar las rutas del vehículo demo LL-305 aparece un error de servicio no disponible. El dispositivo es DEMO-DEVICE-305. Necesitamos saber qué ocurre.',
        sender: 'Usuario demo 04', company: 'Cuenta demo · ficticia', initials: 'UD', time: 'Hace 38 min', category: 'Incidencia API', priority: 'Alta', scenario: 'api_failure'
      },
      {
        id: 'DEMO-1038', subject: 'Integración con un sistema de tacógrafo',
        body: 'Necesitamos integrar un tacógrafo de un fabricante nuevo con nuestro ERP y obtener la homologación del conector. ¿Es compatible y cuándo estaría disponible?',
        sender: 'Usuario demo 05', company: 'Cuenta demo · ficticia', initials: 'UD', time: 'Hace 52 min', category: 'Consulta nueva', priority: 'Media', scenario: 'unknown'
      }
    ],
    knowledge: KNOWLEDGE,
    history: [
      {
        id: 'HIS-021', subject: 'Recuperar contraseña y acceso a la cuenta',
        body: 'He olvidado la contraseña y no puedo acceder a mi cuenta. Necesito recuperar el acceso al panel.',
        solution: PASSWORD_SOLUTION, validated: true,
        keywords: ['contrasena', 'recuperar', 'cuenta', 'acceso']
      },
      {
        id: 'HIS-018', subject: 'Alertas de velocidad ausentes',
        body: 'No llegan alertas de velocidad al vehículo.',
        solution: 'Borrador descartado: revisar únicamente la conexión del dispositivo.', validated: false,
        keywords: ['alerta', 'velocidad', 'vehiculo', 'dispositivo']
      },
      {
        id: 'HIS-009', subject: 'Cambiar el nombre de un vehículo',
        body: 'Quiero cambiar el nombre visible del vehículo en el panel.',
        solution: 'En la ficha del vehículo demo, abre Editar, actualiza el nombre visible y guarda el cambio.', validated: true,
        keywords: ['cambiar', 'nombre', 'visible', 'vehiculo']
      }
    ],
    vehicles: [
      { id: 'VEH-DEMO-204', vehicleId: 'VEH-DEMO-204', name: 'LL-204', plate: 'DEMO 204', deviceId: 'DEMO-DEVICE-204', status: 'Conectado', lastSeen: '10:24', speedLimit: 90, speedAlertsEnabled: false },
      { id: 'VEH-DEMO-305', vehicleId: 'VEH-DEMO-305', name: 'LL-305', plate: 'DEMO 305', deviceId: 'DEMO-DEVICE-305', status: 'Sin verificar · API no disponible', lastSeen: 'Sin dato', speedLimit: null, speedAlertsEnabled: null }
    ]
  };

  function initialData() { return clone(FIXTURES); }

  function vehicleReferences(value) {
    var text = String(value || '');
    var refs = text.match(/\b(?:LL[-_\s]?\d+|VEH[-_\s]DEMO[-_\s]\d+|DEMO[-_\s]DEVICE[-_\s]\d+)\b/gi) || [];
    var namedIdentifier = /(?:veh[ií]culo|dispositivo|deviceid|vehicleid|imei|matr[ií]cula)\s*(?:demo\s+)?(?:es\s+)?[:#=]?\s*([a-z0-9_-]*\d[a-z0-9_-]*)/gi;
    var match;
    while ((match = namedIdentifier.exec(text))) refs.push(match[1]);
    return Array.from(new Set(refs.map(function (ref) {
      var normalized = normalize(ref);
      if (/^(?:ll|veh demo|demo device) 204$/.test(normalized) || normalized === 'll204') return 'VEH-DEMO-204';
      if (/^(?:ll|veh demo|demo device) 305$/.test(normalized) || normalized === 'll305') return 'VEH-DEMO-305';
      return normalized;
    })));
  }

  function scoreHistory(ticket, entry) {
    var text = String(ticket.subject || '') + ' ' + String(ticket.body || '');
    var queryReferences = vehicleReferences(text);
    var referenceIdentifiers = vehicleReferences(String(entry.subject || '') + ' ' + String(entry.body || ''));
    // Vehicle-specific evidence cannot be transferred to another vehicle, or
    // to a query that has not identified a vehicle at all.
    if (referenceIdentifiers.length && (!queryReferences.length || queryReferences.length !== referenceIdentifiers.length || queryReferences.some(function (ref) { return referenceIdentifiers.indexOf(ref) === -1; }))) return 0;
    if (entry.intent && entry.intent !== inferRoute(ticket)) return 0;
    var exactBody = normalize(ticket.body);
    if (exactBody && exactBody === normalize(entry.body)) return 99;
    var queryWords = keywords(text);
    var referenceWords = entry.keywords && entry.keywords.length ? keywords(entry.keywords.join(' ')) : keywords(String(entry.subject || '') + ' ' + String(entry.body || ''));
    if (!queryWords.length || !referenceWords.length) return 0;
    var overlap = referenceWords.filter(function (word) { return queryWords.indexOf(word) !== -1; }).length;
    if (!overlap) return 0;
    var recall = overlap / referenceWords.length;
    var dice = 2 * overlap / (referenceWords.length + queryWords.length);
    // Require at least two meaningful terms so a generic word cannot approve a reuse.
    return Math.min(overlap < 2 ? 35 : 98, Math.round((recall * 0.65 + dice * 0.35) * 100));
  }

  function similarTickets(ticket, history) {
    return history.map(function (entry) {
      return { id: String(entry.id || ''), title: String(entry.subject || 'Caso validado'), score: scoreHistory(ticket, entry), validated: entry.validated === true, solution: String(entry.solution || '') };
    }).filter(function (entry) { return entry.score > 0; }).sort(function (a, b) {
      // Stable sort preserves newest-first history order for equal matches;
      // a newly approved correction wins over the seeded historical answer.
      return b.score - a.score;
    }).slice(0, 3);
  }

  function inferRoute(ticket) {
    // A scenario hint is trusted only for the unchanged curated example.
    // Modified or free-form emails always undergo conservative classification.
    var curated = FIXTURES.tickets.find(function (entry) {
      return entry.scenario === ticket.scenario && entry.subject === ticket.subject && entry.body === ticket.body;
    });
    if (curated) return curated.scenario;
    var terms = keywords(String(ticket.subject || '') + ' ' + String(ticket.body || ''));
    var text = normalize(String(ticket.subject || '') + ' ' + String(ticket.body || ''));
    var refs = vehicleReferences(String(ticket.subject || '') + ' ' + String(ticket.body || ''));
    var vehicle204 = refs.length === 1 && refs[0] === 'VEH-DEMO-204';
    var vehicle305 = refs.length === 1 && refs[0] === 'VEH-DEMO-305';
    if (/503|servicio no disponible|api no disponible|api caida|error de servicio/.test(text)) return vehicle305 ? 'api_failure' : 'unknown';
    if (terms.indexOf('contrasena') !== -1 && terms.some(function (word) { return ['recuperar', 'olvidado', 'olvide', 'acceso', 'cuenta'].indexOf(word) !== -1; })) return 'known';
    if (terms.indexOf('geocerca') !== -1) {
      if (/\b(eliminar|elimina|borrar|borra|quitar|desactivar|editar|modificar|cambiar|error|falla|fallo|problema|no funciona|no avisa|no quiero crear)\b/.test(text)) return 'unknown';
      return /\b(crear|configurar|nueva|anadir|establecer)\b/.test(text) ? 'rag' : 'unknown';
    }
    if (terms.indexOf('velocidad') !== -1 && (terms.indexOf('alerta') !== -1 || terms.indexOf('notificacion') !== -1)) return vehicle204 ? 'combined' : 'unknown';
    return 'unknown';
  }

  function source(id) {
    var doc = KNOWLEDGE.find(function (entry) { return entry.id === id; });
    return clone(doc);
  }

  function step(agent, title, detail, status, evidence) {
    return { agent: agent, title: title, detail: detail, status: status || 'done', evidence: evidence || [] };
  }

  function evidence(label, value) { return { label: label, value: String(value) }; }

  function apiCall(path, request, response, status) {
    return { method: 'GET', path: path, status: status || 200, request: request || {}, response: response };
  }

  function vehicleCalls() {
    var vehicle = FIXTURES.vehicles[0];
    return [
      apiCall('/dev/v1/vehicles', { deviceId: vehicle.deviceId, expandedInfo: true }, { simulated: true, items: [{ vehicleId: vehicle.id, name: vehicle.name, deviceId: vehicle.deviceId }] }),
      apiCall('/dev/v1/vehicles/' + vehicle.id, {}, { simulated: true, vehicleId: vehicle.id, name: vehicle.name, connectivity: 'online', lastSeen: '2026-10-13T10:24:00+02:00' }),
      apiCall('/dev/v1/vehicles/' + vehicle.id + '/notifications/settings', {}, { simulated: true, vehicleId: vehicle.id, speed: { enabled: false, thresholdKmh: 90 }, channels: { email: true, push: true } }),
      apiCall('/dev/v2/vehicles/' + vehicle.id + '/routes', { date: '2026-10-13' }, { simulated: true, vehicleId: vehicle.id, items: [{ routeId: 'ROUTE-DEMO-81', startTime: '09:10', endTime: '09:46', distanceKm: 42, maxSpeedKmh: 104 }] })
    ];
  }

  function plan(ticket, history) {
    ticket = ticket && typeof ticket === 'object' ? ticket : {};
    history = Array.isArray(history) ? history : initialData().history;
    var matches = similarTickets(ticket, history);
    var reusable = matches.find(function (entry) { return entry.validated && entry.score >= 68 && entry.solution.trim(); });
    var inferredRoute = inferRoute(ticket);
    var route = reusable ? 'known' : inferredRoute === 'known' ? 'rag' : inferredRoute;
    var result = {
      route: route, steps: [], response: '', sources: [], apiCalls: [],
      similarTickets: matches, needsHuman: route === 'api_failure' || route === 'unknown', summary: ''
    };

    result.steps.push(step('manager', 'Ticket recibido y clasificado', 'El coordinador prepara el contexto y consulta primero el histórico. La clasificación y las respuestas de esta demo siguen reglas locales.', 'done', [evidence('Ticket', ticket.id || 'Consulta personalizada'), evidence('Modo', 'Simulación local · datos ficticios')]));

    if (reusable) {
      result.steps.push(step('db', 'Solución validada encontrada', 'El histórico contiene una respuesta aprobada para un caso suficientemente parecido. Se reutiliza como borrador para revisión.', 'done', [evidence('Caso recuperado', reusable.id), evidence('Similitud léxica demo', reusable.score + '%'), evidence('Validación', 'Aprobada por una persona')]));
      result.steps.push(step('rag', 'Consulta documental omitida', 'La solución del histórico permite resolver este caso sin nueva búsqueda documental.', 'skipped'));
      result.steps.push(step('api', 'Consulta API omitida', 'Este recorrido reutiliza el histórico; no consulta servicios.', 'skipped'));
      result.response = reusable.solution;
      result.summary = 'Respuesta recuperada del caso validado ' + reusable.id + '. Lista para revisar.';
      return result;
    }

    var unvalidated = matches.find(function (entry) { return !entry.validated && entry.score >= 50; });
    result.steps.push(step('db', 'Sin solución validada reutilizable', unvalidated ? 'Hay un caso parecido, pero su respuesta no está validada. El coordinador continúa con la documentación.' : 'No hay coincidencias validadas que superen el umbral de esta demo. El coordinador continúa con la documentación.', 'done', [evidence('Casos comparados', history.length), evidence('Umbral léxico demo', '68%'), evidence('Resultado', unvalidated ? unvalidated.id + ' descartado: sin validar' : 'Sin coincidencia suficiente')]));

    if (route === 'combined') {
      result.sources = [source('DOC-01'), source('DOC-02')];
      result.steps.push(step('rag', '2 fuentes respaldan el diagnóstico', 'La guía indica revisar la activación de las alertas, el umbral y los canales. La referencia API indica las consultas necesarias.', 'done', [evidence('Fuente', 'DOC-01 · Alertas de velocidad'), evidence('Fuente', 'DOC-02 · Referencia API'), evidence('Siguiente paso', 'Verificar la configuración del vehículo demo')]));
      result.apiCalls = vehicleCalls();
      result.steps.push(step('api', 'Causa identificada en la configuración', 'Cuatro consultas simuladas muestran el vehículo conectado y rutas registradas. La alerta de velocidad está desactivada aunque existen canales habilitados.', 'done', [evidence('Vehículo simulado', 'LL-204'), evidence('Conectividad', 'Online'), evidence('Alerta de velocidad', 'Desactivada'), evidence('Umbral', '90 km/h'), evidence('Velocidad máxima de la ruta', '104 km/h'), evidence('Consultas', '4 GET · todas 200')]));
      result.response = 'Hola, en el vehículo de demostración LL-204 hemos comprobado que el dispositivo está conectado y registra rutas. La última ruta simulada alcanza 104 km/h, por encima del umbral configurado de 90 km/h.\n\nLa consulta de configuración muestra que la alerta de velocidad está desactivada (speed.enabled=false). Los canales de correo y push sí están habilitados. Esto explica la ausencia de alertas en este escenario. [DOC-01]\n\nProponemos activar la alerta de velocidad, confirmar el umbral y comprobar la recepción con un recorrido de prueba. Las consultas realizadas son de lectura: todavía no se ha modificado ninguna configuración. [DOC-02]';
      result.summary = 'Diagnóstico con histórico, documentos y 4 consultas API simuladas. Borrador listo para revisión.';
    } else if (route === 'rag') {
      var password = inferredRoute === 'known';
      result.sources = [source(password ? 'DOC-04' : 'DOC-03')];
      result.steps.push(step('rag', 'Respuesta basada en la documentación', 'Se recupera el procedimiento correspondiente y se prepara un borrador con su referencia verificable.', 'done', [evidence('Documento', result.sources[0].id), evidence('Título', result.sources[0].title), evidence('Origen', result.sources[0].source)]));
      result.steps.push(step('api', 'Consulta API omitida', 'Esta consulta solicita instrucciones de uso; no necesita consultar datos de un vehículo.', 'skipped'));
      result.response = password ? PASSWORD_SOLUTION + ' [DOC-04]' : 'Hola, para configurar una geocerca en el panel de demostración:\n\n1. Abre Geocercas > Nueva geocerca.\n2. Dibuja el perímetro del almacén, asigna un nombre y guarda.\n3. Asocia los vehículos que deseas supervisar.\n4. Activa los eventos de entrada, salida o ambos y elige el canal de aviso.\n5. Comprueba la configuración con un recorrido de prueba.\n\nEstos pasos proceden del manual de usuario demo. No se ha creado ni modificado ninguna geocerca. [DOC-03]';
      result.summary = 'Guía preparada con una fuente documental. No requiere consultas API.';
    } else if (route === 'api_failure') {
      result.sources = [source('DOC-02'), source('DOC-05')];
      result.steps.push(step('rag', 'Procedimiento de comprobación y escalado', 'La referencia indica cómo consultar rutas y cómo proceder si el servicio no está disponible.', 'done', [evidence('Fuentes', 'DOC-02 · DOC-05'), evidence('Regla', 'Detener la cadena si falla el servicio')]));
      result.apiCalls = [apiCall('/dev/v1/vehicles', { deviceId: 'DEMO-DEVICE-305', expandedInfo: true }, { simulated: true, error: 'SERVICE_UNAVAILABLE', message: 'Servicio temporalmente no disponible', traceId: 'DEMO-TRACE-503' }, 503)];
      result.steps.push(step('api', 'Servicio no disponible · revisión humana', 'La primera consulta simulada devuelve 503. La cadena se detiene; no se consulta la configuración ni se inventa el estado del vehículo.', 'error', [evidence('HTTP', '503 Service Unavailable'), evidence('Seguimiento', 'DEMO-TRACE-503'), evidence('Acción', 'Escalar a soporte')]));
      result.response = 'Hola, la consulta al servicio de vehículos de la demostración devuelve un error 503 (servicio no disponible). Hemos detenido las comprobaciones y preparado el caso para revisión por soporte.\n\nCon la información disponible no podemos confirmar el estado del vehículo ni de sus rutas. La referencia para investigar esta incidencia simulada es DEMO-TRACE-503. No se ha realizado ningún cambio. [DOC-05]';
      result.summary = 'API simulada no disponible. Se requiere revisión humana antes de responder.';
    } else {
      result.steps.push(step('rag', 'No hay documentación suficiente', 'El conocimiento ficticio de esta demo no contiene una fuente que permita responder a esta consulta con garantías.', 'done', [evidence('Fuentes aplicables', '0'), evidence('Decisión', 'Solicitar revisión humana')]));
      result.steps.push(step('api', 'Consulta API omitida', 'No se ha identificado una consulta compatible con las capacidades simuladas.', 'skipped'));
      result.response = 'Gracias por la consulta. No disponemos de una solución validada ni de documentación suficiente en esta demostración para confirmar una respuesta. El caso necesita revisión de una persona del equipo de soporte, que podrá solicitar la información necesaria y valorar los siguientes pasos.';
      var queryTerms = keywords(String(ticket.subject || '') + ' ' + String(ticket.body || ''));
      if (queryTerms.indexOf('velocidad') !== -1 && (queryTerms.indexOf('alerta') !== -1 || queryTerms.indexOf('notificacion') !== -1)) {
        result.response = 'Para comprobar las alertas necesitamos identificar un vehículo compatible con esta demostración. El diagnóstico de velocidad disponible corresponde únicamente a LL-204 (dispositivo DEMO-DEVICE-204). No podemos confirmar la configuración de otro vehículo ni aplicar a ese vehículo los resultados del ejemplo. El caso queda pendiente de aclaración y revisión humana.';
      }
      result.summary = 'Sin respaldo documental. Revisión humana requerida; no se inventa una solución.';
    }
    return result;
  }

  function learn(ticket, solution, history) {
    if (!ticket || typeof ticket !== 'object') throw new TypeError('Se necesita un ticket para guardar la validación.');
    if (typeof solution !== 'string' || !solution.trim()) throw new TypeError('La respuesta validada no puede estar vacía.');
    var current = Array.isArray(history) ? history : initialData().history;
    var id = 'LEARN-' + String(ticket.id || 'CUSTOM');
    var learned = {
      id: id, subject: String(ticket.subject || 'Consulta personalizada'), body: String(ticket.body || ''),
      solution: solution.trim(), validated: true, intent: inferRoute(ticket),
      keywords: keywords(String(ticket.subject || '') + ' ' + String(ticket.body || ''))
    };
    return [learned].concat(clone(current.filter(function (entry) { return entry.id !== id; })));
  }

  return { initialData: initialData, plan: plan, keywords: keywords, learn: learn };
}));
