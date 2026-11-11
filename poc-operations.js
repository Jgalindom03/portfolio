(() => {
  const U=window.POC_UI,{t,e}=U;
  const chat=messages=>'<div class="poc-chat">'+messages.map(m=>'<div class="poc-bubble '+(m.role==="user"?"poc-user":"")+'">'+e(m.text)+'</div>').join("")+'</div>';
  window.POC_MODULES["voice-agents"]=()=>({
    basis:"cv",title:()=>t("Voice operations studio","Estudio de operaciones por voz"),
    init:()=>({tab:"conversation",task:"Appointment",stage:0,turns:[],bookings:[],day:"Tuesday",time:"10:30",guests:"2",issue:"Revisión del vehículo",message:""}),
    tabs:()=>[["conversation",t("Call walkthrough","Recorrido de llamada")],["calendar",t("Calendar & reservations","Agenda y reservas")],["trace",t("Workflow execution","Ejecución del flujo")]],
    render(s,u){
      const {field:f,select:sel,input:i,button:b,notice:n}=u;
      const active=s.bookings.filter(x=>!x.cancelled).length;
      const metrics='<div class="wb-metrics">'+u.metric(t("Active reservations","Reservas activas"),active,"calendar","teal")+u.metric(t("Conversation turns","Turnos de conversación"),s.turns.length,"message","blue")+u.metric(t("Call status","Estado de llamada"),s.stage===5?t("Completed","Completada"):s.stage?t("In progress","En curso"):t("Ready","Preparada"),"phone","amber")+'</div>';
      const steps=[t("Listen & identify","Escuchar e identificar"),t("Collect details","Recoger datos"),t("Check availability","Consultar agenda"),t("Confirm request","Confirmar solicitud"),t("Update calendar","Actualizar agenda")];
      const flow='<div class="wb-stepper">'+steps.map((label,index)=>'<div class="wb-step '+(index<s.stage?'is-done':index===s.stage?'is-active':'')+'"><span>'+u.icon(index<s.stage?"check":"route")+'</span><div><strong>'+label+'</strong><small>'+t(index<s.stage?"Completed":index===s.stage?"Current step":"Waiting",index<s.stage?"Completado":index===s.stage?"Paso actual":"En espera")+'</small></div></div>').join("")+'</div>';
      if(s.tab==="calendar")return metrics+u.panel(t("Your sample calendar","Tu agenda de muestra"),t("Confirmed slots and cancellation management","Huecos confirmados y gestión de cancelaciones"),(s.bookings.length?u.table(["ID",t("Service","Servicio"),t("Slot","Hueco"),t("Status","Estado")],s.bookings.map(x=>[x.id,x.task,x.day+" "+x.time,x.cancelled?t("Cancelled","Cancelada"):t("Confirmed","Confirmada")])):'<div class="wb-empty">'+u.icon("calendar")+'<strong>'+t("The calendar is ready","La agenda está preparada")+'</strong><p>'+t("Complete a call to see its reservation here.","Completa una llamada para ver su reserva aquí.")+'</p></div>')+f(t("Reservation ID","ID de reserva"),i("cancelId",""))+b(t("Cancel reservation","Cancelar reserva"),"cancel","poc-secondary"),"calendar","teal");
      if(s.tab==="trace")return metrics+u.panel(t("The workflow behind the call","El flujo detrás de la llamada"),"n8n · Vapi · ElevenLabs",flow+n(t("Tool transitions are simulated. No microphone or telephony session starts.","Se simulan las transiciones de herramientas. No se inicia el micrófono ni una sesión telefónica."))+b(t("Export execution","Exportar ejecución"),"export","poc-secondary"),"route","blue");
      const conversation=f(t("Use case","Caso de uso"),sel("task",["Appointment","Workshop","Restaurant","Information"],s.task))+b(t("Start new call","Iniciar nueva llamada"),"start")+(s.turns.length?chat(s.turns):'<div class="wb-empty">'+u.icon("phone")+'<strong>'+t("Ready to answer","Preparado para atender")+'</strong><p>'+t("Choose a service and start a call to follow the conversation.","Elige un servicio e inicia una llamada para seguir la conversación.")+'</p></div>');
      const booking=f(t("Day","Día"),sel("day",["Tuesday","Thursday","Friday"],s.day))+f(t("Time","Hora"),sel("time",["10:30","12:00","18:00"],s.time))+f(t("Guests / party size","Comensales"),i("guests",s.guests,"number",'min="1" max="8"'))+f(t("Service request / question","Servicio o consulta"),i("issue",s.issue))+n(t("Tuesday 12:00 is already occupied. Restaurant capacity: 6 guests per slot.","El martes a las 12:00 ya está ocupado. Capacidad del restaurante: 6 personas por turno."))+b(s.stage<3?t("Continue call","Continuar llamada"):t("Confirm request","Confirmar solicitud"),"next")+(s.stage===3?b(t("Decline / choose another slot","Rechazar / elegir otro hueco"),"decline","poc-secondary"):"");
      return metrics+'<div class="wb-grid">'+u.panel(t("Live conversation","Conversación en curso"),t("A service request, one turn at a time","Una solicitud de servicio, turno a turno"),conversation,"phone","teal")+u.panel(t("Reservation details","Datos de la reserva"),t("Availability is checked before confirmation","La disponibilidad se comprueba antes de confirmar"),booking,"calendar","amber")+'</div>';
    },

    action(s,a,v,u){
      if(a==="start"){Object.assign(s,{task:v.task,stage:1,turns:[{role:"assistant",text:t("Hello. What can I help you with?","Hola. ¿En qué puedo ayudarte?")}],day:v.day,time:v.time,guests:v.guests,issue:v.issue,message:""});return;}
      if(a==="next"){
        if(!s.stage)throw Error(t("Start the call first.","Inicia primero la llamada."));
        Object.assign(s,{day:v.day,time:v.time,guests:v.guests,issue:v.issue});
        if(s.stage===1){s.turns.push({role:"user",text:s.task+" · "+s.issue},{role:"assistant",text:s.task==="Information"?t("Saturday opening hours are 10:00–14:00 in this sample.","El horario de muestra del sábado es de 10:00 a 14:00."):t("Which day and time would you prefer?","¿Qué día y hora prefieres?")});s.stage=s.task==="Information"?5:2;return;}
        if(s.stage===2){
          if(s.task==="Restaurant"&&(!Number.isInteger(Number(s.guests))||Number(s.guests)<1||Number(s.guests)>6))throw Error(t("Party size exceeds sample capacity (1–6).","El grupo supera la capacidad de muestra (1–6)."));
          const occupied=(s.day==="Tuesday"&&s.time==="12:00")||s.bookings.some(x=>!x.cancelled&&x.day===s.day&&x.time===s.time);
          s.turns.push({role:"user",text:s.day+" · "+s.time});
          if(occupied){s.turns.push({role:"assistant",text:t("That slot is occupied. Please choose another time.","Ese hueco está ocupado. Elige otro horario.")});s.message=t("Availability conflict; nothing booked.","Conflicto de disponibilidad; no se ha reservado.");return;}
          s.turns.push({role:"assistant",text:t("The slot is available. Do you confirm?","El hueco está disponible. ¿Confirmas?")});s.pending={day:s.day,time:s.time,guests:s.guests,issue:s.issue};s.stage=3;return;
        }
        if(s.stage===3){
          if(!s.pending||Object.keys(s.pending).some(key=>s.pending[key]!==s[key])){s.stage=2;s.message=t("The request changed. Recheck availability before confirming.","La solicitud ha cambiado. Consulta la disponibilidad antes de confirmar.");return;}
          const id="DEMO-"+String(s.bookings.length+1).padStart(3,"0");s.bookings.push({id,task:s.task,day:s.day,time:s.time,guests:s.guests,issue:s.issue,cancelled:false});s.turns.push({role:"user",text:t("Yes, confirm.","Sí, confirmo.")},{role:"assistant",text:t("Your demo reservation is confirmed: ","Tu reserva de muestra está confirmada: ")+id});s.stage=5;s.message=t("Sample calendar updated.","Agenda de muestra actualizada.");return;
        }
        s.message=t("This call is complete. Start another call.","Esta llamada ha terminado. Inicia otra llamada.");
      }
      if(a==="decline"){s.stage=2;s.turns.push({role:"user",text:t("I prefer another time.","Prefiero otro horario.")});}
      if(a==="cancel"){const b=s.bookings.find(x=>x.id===v.cancelId);if(!b)throw Error(t("Reservation not found.","Reserva no encontrada."));b.cancelled=true;s.message=t("Reservation cancelled locally.","Reserva cancelada localmente.");}
      if(a==="export")u.download("voice-workflow.json",JSON.stringify(s,null,2),"application/json");
    }
  });
  window.POC_MODULES.whatsapp=()=>{
    const memory=[{question:"No puedo acceder a mi cuenta contraseña",answer:"Utiliza la opción de recuperar contraseña y el correo asociado a la cuenta."}];
    const docs=[{question:"crear geocerca avisos entrada salida",answer:"En Geocercas, crea un perímetro, asocia el vehículo y activa los avisos de entrada o salida."},{question:"alertas velocidad vehículo notificaciones",answer:"Comprueba que la alerta de velocidad y el canal de notificación están habilitados."}];
    return {
      basis:"source",title:()=>t("Messaging service desk","Bandeja de soporte por mensajería"),
      init:()=>({tab:"inbox",messages:[],memory:memory.map(x=>({...x})),trace:[],draft:"",lastQuery:"",handoff:false,message:""}),
      tabs:()=>[["inbox",t("Conversation","Conversación")],["knowledge",t("DB & RAG knowledge","Conocimiento DB y RAG")],["trace",t("Routing & handoff","Enrutamiento y derivación")]],
      render(s,u){
        const {field:f,area:a,button:b,notice:n}=u;
        const metrics='<div class="wb-metrics">'+u.metric(t("Incoming messages","Mensajes recibidos"),s.messages.filter(x=>x.role==="user").length,"message","teal")+u.metric(t("Memory entries","Respuestas en memoria"),s.memory.length,"database","blue")+u.metric(t("Support mode","Modo de atención"),s.handoff?t("Human review","Revisión humana"):t("Automated","Automático"),"users",s.handoff?"amber":"teal")+'</div>';
        if(s.tab==="knowledge")return metrics+'<div class="wb-grid">'+u.panel(t("Resolved cases","Casos resueltos"),t("DB: reusable answers from this session","DB: respuestas reutilizables de esta sesión"),u.table([t("Question","Consulta"),t("Response","Respuesta")],s.memory.map(x=>[x.question,x.answer])),"database","blue")+u.panel(t("Document knowledge","Conocimiento documental"),t("RAG: passages available to the assistant","RAG: fragmentos disponibles para el asistente"),u.table([t("Topic","Tema"),t("Passage","Fragmento")],docs.map(x=>[x.question,x.answer])),"book","accent")+'</div>';
        if(s.tab==="trace")return metrics+u.panel(t("Why this route was chosen","Por qué se eligió esta ruta"),t("Inspect each message and its retrieval path","Inspecciona cada mensaje y su recorrido de recuperación"),n(t("Source behavior: DB similarity ≥ 0.30 → stored solution; otherwise RAG. User-visible answers have internal tags removed. Lexical similarity substitutes embeddings here.","Comportamiento del código: similitud DB ≥ 0,30 → solución almacenada; si no, RAG. Se eliminan las etiquetas internas. Aquí la similitud léxica sustituye a los embeddings."))+u.table([t("Message","Mensaje"),t("Route","Ruta"),t("Match","Coincidencia")],s.trace.map(x=>[x.query,x.route,x.score]))+b(t("Export conversation","Exportar conversación"),"export","poc-secondary"),"route","blue");
        const thread=(s.messages.length?chat(s.messages):'<div class="wb-empty">'+u.icon("message")+'<strong>'+t("Start a support conversation","Inicia una conversación de soporte")+'</strong><p>'+t("Ask a question or choose a prepared example below.","Escribe una consulta o elige uno de los ejemplos preparados.")+'</p></div>')+f(t("Message","Mensaje"),a("message","",3))+b(t("Send message","Enviar mensaje"),"send")+'<div class="wb-chips">'+b(t("Password recovery","Recuperar contraseña"),"example:password","poc-secondary")+b(t("Create geofence","Crear geocerca"),"example:geo","poc-secondary")+b(t("Out of scope","Fuera de dominio"),"example:outside","poc-secondary")+'</div>';
        const review='<span class="wb-inline-status wb-tone-'+(s.handoff?'amber':'teal')+'">'+u.icon(s.handoff?"users":"check")+' '+(s.handoff?t("Assigned to a person","Asignado a una persona"):t("Automation active","Automatización activa"))+'</span>'+f(t("Team reply / reviewed solution","Respuesta del equipo / solución revisada"),a("review",s.draft,5))+b(t("Send reviewed reply & store in memory","Enviar respuesta revisada y guardar en memoria"),"approve")+b(t("Hand off to the team","Derivar al equipo"),"handoff","poc-secondary")+b(t("Resume automation","Reanudar automatización"),"resume","poc-secondary");
        return metrics+'<div class="wb-grid">'+u.panel(t("Customer conversation","Conversación de soporte"),t("The full context stays with the conversation","El contexto completo acompaña a la conversación"),thread,"message","teal")+u.panel(t("Human review desk","Mesa de revisión humana"),t("Edit, approve or take over the conversation","Edita, aprueba o asume la conversación"),review,"users","amber")+'</div>';
      },

      action(s,a,v,u){
        if(a==="handoff"){s.handoff=true;s.message=t("Conversation assigned to the team.","Conversación asignada al equipo.");return;}
        if(a==="resume"){s.handoff=false;return;}
        if(a==="export"){u.download("messaging-session.json",JSON.stringify(s,null,2),"application/json");return;}
        if(a==="approve"){if(!v.review.trim()||!s.lastQuery)throw Error(t("Select a conversation and write a reply.","Inicia una conversación y escribe una respuesta."));s.memory.push({question:s.lastQuery,answer:v.review});s.messages.push({role:"assistant",text:v.review});s.draft=v.review;s.message=t("Reviewed solution stored in local memory.","Solución revisada guardada en memoria local.");return;}
        if(a==="send"||a.startsWith("example:")){
          const q=a==="send"?v.message:{"example:password":"No puedo acceder a mi cuenta, necesito recuperar contraseña","example:geo":"¿Cómo puedo crear una geocerca?","example:outside":"Quiero una receta de cocina"}[a];
          if(!q?.trim())throw Error(t("Write a message first.","Escribe primero un mensaje."));
          s.lastQuery=q;s.messages.push({role:"user",text:q});
          if(s.handoff){s.message=t("Message queued for the team.","Mensaje en cola para el equipo.");return;}
          const ranked=s.memory.map(x=>({...x,score:u.score(q,x.question)})).sort((a,b)=>b.score-a.score);
          const doc=docs.map(x=>({...x,score:u.score(q,x.question)})).sort((a,b)=>b.score-a.score)[0];
          const hit=ranked[0]?.score>=.3?ranked[0]:doc?.score>=.2?doc:null,route=ranked[0]?.score>=.3?"DB":hit?"RAG":"Domain guard";
          const response=hit?hit.answer:t("I can help with technical support questions about the sample platform. Please contact the team for other topics.","Puedo ayudarte con soporte técnico de la plataforma de muestra. Para otros temas, contacta con el equipo.");
          s.messages.push({role:"assistant",text:response.replace(/\{[^}]*\}/g,"").trim()});s.draft=response;s.trace.push({query:q,route,score:Math.round((hit?.score||0)*100)+"% lexical"});return;
        }
      }
    };
  };
  const contextRoute = context => context === "Unknown" ? "Clarify" : context === "Employee" ? "Internal" : "External";
  window.POC_MODULES["azure-agents"]=()=>({
    basis:"cv",title:()=>t("Five-agent ambiguity lab","Laboratorio de ambigüedad de cinco agentes"),
    init:()=>({tab:"request",query:"Necesito acceso al informe",context:"Employee",clarified:false,result:null,history:[],message:""}),
    tabs:()=>[["request",t("Request & clarification","Consulta y aclaración")],["trace",t("Five-agent trace","Traza de cinco agentes")],["evaluation",t("Evaluation scenarios","Escenarios de evaluación")]],
    render(s,u){
      const {field:f,input:i,select:sel,button:b,notice:n}=u;
      const metrics='<div class="wb-metrics">'+u.metric(t("Specialist roles","Roles especializados"),5,"users","accent")+u.metric(t("Requests explored","Consultas exploradas"),s.history.length,"message","blue")+u.metric(t("Evaluation fixtures","Casos de evaluación"),s.tests?.length||0,"check","teal")+'</div>';
      if(s.tab==="evaluation")return metrics+u.panel(t("Similar questions, checked systematically","Consultas similares, revisadas con criterio"),t("Compare expected and actual routing","Compara el enrutamiento esperado y el obtenido"),n(t("These test cases and five agent roles are illustrative: the CV does not disclose the original domains or prompts.","Estos casos y los cinco roles son ilustrativos: el CV no especifica los dominios ni los prompts originales."))+b(t("Run regression examples","Ejecutar ejemplos de regresión"),"evaluate")+(s.tests?u.table(["Query","Context","Expected","Actual","Check"],s.tests):'<div class="wb-empty">'+u.icon("check")+'<strong>'+t("Ready to evaluate","Preparado para evaluar")+'</strong></div>'),"check","teal");
      if(s.tab==="trace")return metrics+u.panel(t("Inside the agent team","Dentro del equipo de agentes"),t("From intent to evidence and review","De la intención a la evidencia y la revisión"),(s.result?'<div class="wb-stepper">'+s.result.trace.map(([name,result])=>'<div class="wb-step is-done"><span>'+u.icon("route")+'</span><div><strong>'+e(name)+'</strong><small>'+e(result)+'</small></div></div>').join("")+'</div>':'<div class="wb-empty">'+u.icon("route")+'<strong>'+t("The trace starts with a request","La traza comienza con una consulta")+'</strong><p>'+t("Run a request to follow all five roles.","Ejecuta una consulta para seguir los cinco roles.")+'</p></div>')+b(t("Export trace","Exportar traza"),"export","poc-secondary"),"route","blue");
      const request=f(t("User request","Consulta de usuario"),i("query",s.query))+f(t("User context","Contexto de usuario"),sel("context",["Unknown","Employee","External partner"],s.context))+b(t("Resolve with agent team","Resolver con el equipo"),"run");
      const result=s.result?'<div class="wb-result-banner"><h4>'+e(s.result.title)+'</h4><p>'+e(s.result.answer)+'</p></div>'+n(s.result.source):'<div class="wb-empty">'+u.icon("search")+'<strong>'+t("Context changes the answer","El contexto cambia la respuesta")+'</strong><p>'+t("Try the same question with different user contexts.","Prueba la misma consulta con distintos contextos de usuario.")+'</p></div>';
      return metrics+'<div class="wb-grid">'+u.panel(t("Incoming request","Consulta recibida"),t("A similar wording may need a different route","Una formulación similar puede necesitar otra ruta"),request,"message","accent")+u.panel(t("Contextual answer","Respuesta contextual"),t("A response grounded in the selected context","Una respuesta basada en el contexto seleccionado"),result,"file","teal")+'</div>';
    },

    action(s,a,v,u){
      if(a==="run"){
        s.query=v.query.trim();s.context=v.context;if(!s.query)throw Error(t("Write a request.","Escribe una consulta."));
        const unknown=contextRoute(s.context)==="Clarify";
        s.result={title:unknown?t("Clarification required","Se necesita aclaración"):s.context==="Employee"?t("Internal access route","Ruta de acceso interno"):t("External access route","Ruta de acceso externo"),answer:unknown?t("Are you an employee or an external partner? Choose a context and submit again.","¿Eres empleado o colaborador externo? Selecciona el contexto y vuelve a consultar."):s.context==="Employee"?t("Request the internal resource through the sample identity workflow with manager approval.","Solicita el recurso interno mediante el flujo de identidad de muestra y la aprobación del responsable."):t("Use the sample external access process with a sponsoring contact and expiry date.","Usa el proceso de acceso externo de muestra con una persona patrocinadora y fecha de caducidad."),source:unknown?"No source selected":"Demo policy · "+s.context,trace:[["1 · Intake",s.query],["2 · Disambiguation",unknown?"Needs context":s.context],["3 · Retrieval",unknown?"Paused":"Context-specific sample policy"],["4 · Response",unknown?"Clarifying question":"Grounded draft"],["5 · Evaluation",unknown?"Incomplete context":"Context and citation checked"]]};s.history.push(s.result);return;
      }
      if(a==="evaluate"){s.tests=[["Unknown","Clarify"],["Employee","Internal"],["External partner","External"]].map(([context,expected])=>{const actual=contextRoute(context);return ["Necesito acceso al informe",context,expected,actual,actual===expected?"PASS":"FAIL"];});s.message=t("3 deterministic fixtures passed; not a model accuracy measurement.","3 casos deterministas superados; no es una medición de precisión de un modelo.");}
      if(a==="export")u.download("five-agent-trace.json",JSON.stringify(s.history,null,2),"application/json");
    }
  });
  window.POC_MODULES["bank-delivery"]=()=>({
    basis:"cv",title:()=>t("End-to-end delivery cockpit","Panel de entrega end to end"),
    init:()=>({tab:"dependencies",gates:[{name:"Cloud account",team:"Cloud",done:false},{name:"Network / firewall",team:"Security",done:false},{name:"Entra ID / permissions",team:"Identity",done:false},{name:"Backend integration",team:"Engineering",done:false},{name:"Prompts / guardrails",team:"AI Engineering",done:false},{name:"Functional evaluation",team:"Business + QA",done:false}],events:[],deployed:false,message:""}),
    tabs:()=>[["dependencies",t("Dependencies & owners","Dependencias y responsables")],["incidents",t("Incident diagnosis","Diagnóstico de incidencias")],["readiness",t("Release readiness","Preparación del despliegue")],["report",t("Stakeholder update","Seguimiento ejecutivo")]],
    render(s,u){
      const {field:f,select:sel,button:b,notice:n}=u;
      const ready=s.gates.filter(g=>g.done).length,blocked=s.gates.length-ready;
      const metrics='<div class="wb-metrics">'+u.metric(t("Dependencies resolved","Dependencias resueltas"),ready+"/"+s.gates.length,"check","teal")+u.metric(t("Open blockers","Bloqueos abiertos"),blocked,"shield",blocked?"amber":"teal")+u.metric(t("Release status","Estado de entrega"),s.deployed?t("Recorded","Registrada"):blocked?t("Blocked","Bloqueada"):t("Ready","Preparada"),"cloud",s.deployed?"teal":"blue")+'</div>';
      if(s.tab==="dependencies")return metrics+n(t("Reconstruction of responsibilities described in the CV. Teams, requests and status are fictional.","Reconstrucción de las responsabilidades del CV. Equipos, solicitudes y estados ficticios."))+'<div class="wb-product-grid">'+s.gates.map((g,index)=>u.panel(g.name,g.team,'<span class="wb-inline-status wb-tone-'+(g.done?'teal':'amber')+'">'+u.icon(g.done?"check":"shield")+' '+(g.done?t("Resolved","Resuelta"):t("Pending","Pendiente"))+'</span>'+b(g.done?t("Reopen","Reabrir"):t("Resolve","Resolver"),"gate:"+index,"poc-secondary"),["cloud","shield","key","code","message","check"][index],g.done?"teal":"amber")).join("")+'</div>';
      if(s.tab==="incidents")return metrics+'<div class="wb-grid">'+u.panel(t("Delivery blocker","Bloqueo de entrega"),t("Identify the symptom before assigning the next action","Identifica el síntoma antes de asignar la siguiente acción"),f(t("Symptom","Síntoma"),sel("symptom",["401 authentication","403 permissions","Timeout / firewall","Response latency","Ungrounded answer"],"401 authentication"))+b(t("Create action plan","Preparar plan de acción"),"diagnose"),"shield","amber")+u.panel(t("Action plan","Plan de acción"),t("A clear owner and a focused investigation","Un responsable claro y una investigación concreta"),s.diagnosis?n(s.diagnosis):'<div class="wb-empty">'+u.icon("search")+'<strong>'+t("Choose a blocker to investigate","Elige un bloqueo que investigar")+'</strong></div>',"route","blue")+'</div>';
      if(s.tab==="readiness")return metrics+u.panel(t("Release readiness review","Revisión de preparación del despliegue"),t("Every dependency must be resolved before release","Cada dependencia debe estar resuelta antes de desplegar"),'<progress value="'+ready+'" max="6"></progress>'+u.table(["Check","State"],s.gates.map(g=>[g.name,g.done?"Ready":"Blocked"]))+b(t("Attempt release","Intentar despliegue"),"release")+(s.deployed?n(t("Demo release recorded.","Despliegue de muestra registrado."),"success"):""),"cloud","teal");
      return metrics+u.panel(t("Stakeholder progress report","Informe de avance para responsables"),t("Current readiness, ownership and recorded decisions","Preparación actual, responsables y decisiones registradas"),u.table(["Metric","Value"],[["Resolved dependencies",ready+"/6"],["Pending owners",s.gates.filter(g=>!g.done).map(g=>g.team).join(", ")],["Release",s.deployed?"Ready":"Pending"]])+s.events.map(x=>'<div class="wb-step is-done"><span>'+u.icon("activity")+'</span><div><p>'+e(x)+'</p></div></div>').join("")+b(t("Export status report","Exportar informe de seguimiento"),"export"),"activity","blue");
    },

    action(s,a,v,u){
      if(a.startsWith("gate:")){const g=s.gates[Number(a.slice(5))];g.done=!g.done;s.deployed=false;s.events.push(g.name+" → "+(g.done?"Resolved":"Reopened"));return;}
      if(a==="release"){const pending=s.gates.filter(x=>!x.done);if(pending.length)throw Error(t("Release blocked: ","Despliegue bloqueado: ")+pending.map(x=>x.name).join(", "));s.deployed=true;s.events.push("Demo release completed");return;}
      if(a==="diagnose"){s.diagnosis={"401 authentication":"Identity: validate audience, tenant and service identity; coordinate authentication check.","403 permissions":"Identity + Security: review roles, resource access and owner approval.","Timeout / firewall":"Network: check routing and firewall dependencies with the infrastructure team.","Response latency":"Engineering: isolate retrieval/model/backend timings before changes.","Ungrounded answer":"AI Engineering: review retrieval context, prompt and guardrails; rerun functional evaluation."}[v.symptom];s.events.push(v.symptom+" → "+s.diagnosis);}
      if(a==="export")u.download("delivery-status.json",JSON.stringify(s,null,2),"application/json");
    }
  });
})();
