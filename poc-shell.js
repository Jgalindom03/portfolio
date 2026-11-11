(() => {
  const e = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
  const t = (en, es) => document.documentElement.lang === "es" ? es : en;
  const iconPaths = {
    user:'<circle cx="12" cy="8" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 4 5"/>',
    briefcase:'<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M8 7V4h8v3M3 12a20 20 0 0 0 18 0M10 13h4"/>',
    message:'<path d="M21 12a8 8 0 0 1-8 8H7l-5 2 2-6a8 8 0 0 1-1-4V8a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6zM8 9h8M8 13h5"/>',
    file:'<path d="M14 2H5v20h14V7zM14 2v5h5M8 12h8M8 16h6"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    chart:'<path d="M3 3v18h18M7 16v-4M12 16V7M17 16v-7"/>',
    layers:'<path d="m12 2 10 6-10 6L2 8zM2 12l10 6 10-6M2 16l10 6 10-6"/>',
    upload:'<path d="M12 16V3m-5 5 5-5 5 5M3 15v6h18v-6"/>',
    search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
    book:'<path d="M12 5C8 2 4 2 2 3v16c4-1 7 0 10 2 3-2 6-3 10-2V3c-3-1-6 0-10 2v16"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
    spark:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>',
    download:'<path d="M12 3v13m-5-5 5 5 5-5M3 16v5h18v-5"/>',
    phone:'<path d="m5 2 4 5-3 3c2 4 4 6 8 8l3-3 5 4c-2 5-6 4-11 1C5 16 0 8 5 2z"/>',
    calendar:'<rect x="3" y="5" width="18" height="17" rx="3"/><path d="M3 10h18M7 2v6M17 2v6M7 14h3M14 14h3M7 18h3"/>',
    database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/>',
    route:'<circle cx="5" cy="5" r="3"/><circle cx="19" cy="19" r="3"/><path d="M8 5h9a4 4 0 0 1 0 8H7a4 4 0 0 0 0 8h9"/>',
    shield:'<path d="m12 2 9 4v6c0 5-5 8-9 10-4-2-9-5-9-10V6zM8 12l3 3 5-6"/>',
    key:'<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9M15 15l3-3M18 18l3-3"/>',
    cloud:'<path d="M6 19h12a5 5 0 0 0 0-10 7 7 0 0 0-13-1 6 6 0 0 0 1 11z"/>',
    code:'<path d="m8 5-6 7 6 7m8-14 6 7-6 7m-2-16-4 18"/>',
    activity:'<path d="M2 12h4l3-9 6 18 3-9h4"/>',
    car:'<path d="m5 7 2-4h10l2 4 3 3v8H2v-8zM5 7h14M2 13h20M5 18v3M19 18v3M5 10h2M17 10h2"/>',
    pin:'<path d="M20 9c0 6-8 13-8 13S4 15 4 9a8 8 0 1 1 16 0z"/><circle cx="12" cy="9" r="3"/>',
    wallet:'<path d="M3 6V4l15-2v4M3 6h18v15H3zM21 11h-7v5h7"/>',
    video:'<rect x="2" y="5" width="13" height="14" rx="3"/><path d="m15 9 7-4v14l-7-4"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>'
  };
  const icon = name => '<svg class="wb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+(iconPaths[name]||iconPaths.layers)+'</svg>';
  const metric = (label,value,name="activity",tone="accent") => '<article class="wb-metric wb-tone-'+e(tone)+'"><span class="wb-metric-icon">'+icon(name)+'</span><div><span class="wb-metric-label">'+e(label)+'</span><strong class="wb-metric-value">'+e(value)+'</strong></div></article>';
  const panel = (title,subtitle,body,name="layers",tone="accent") => '<section class="wb-panel wb-tone-'+e(tone)+'"><header class="wb-panel-head"><span class="wb-panel-symbol">'+icon(name)+'</span><div><h3 class="wb-panel-title">'+e(title)+'</h3>'+(subtitle?'<p>'+e(subtitle)+'</p>':"")+'</div></header><div class="wb-panel-body">'+body+'</div></section>';
  const actionIcons={start:"arrow",run:"spark",load:"upload",upload:"upload",ingest:"layers",ask:"search",send:"message",chat:"message",next:"arrow",approve:"check",book:"calendar",availability:"calendar",export:"download","cv-export":"download",pdf:"download",finance:"wallet",configure:"layers",offer:"file",lead:"user",trade:"car",reset:"route",evaluate:"check",release:"shield",diagnose:"activity"};
  const button = (label, action, tone="") => '<button type="button" class="poc-button '+tone+'" data-action="'+e(action)+'">'+(actionIcons[action]?icon(actionIcons[action]):"")+e(label)+'</button>';
  const field = (label, control) => '<label class="poc-field"><span>'+e(label)+'</span>'+control+'</label>';
  const input = (name,value="",type="text",attrs="") => '<input name="'+e(name)+'" type="'+type+'" value="'+e(value)+'" '+attrs+'>';
  const area = (name,value="",rows=4) => '<textarea name="'+e(name)+'" rows="'+rows+'">'+e(value)+'</textarea>';
  const select = (name, options, value) => '<select name="'+e(name)+'">'+options.map((o,i)=>{const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return '<option value="'+e(v)+'" '+(String(v)===String(value)?'selected':'')+'>'+e(l)+'</option>';}).join("")+'</select>';
  const notice = (text,kind="") => '<div class="wb-notice '+kind+'">'+e(text)+'</div>';
  const table = (headers,rows) => '<div class="wb-table-wrap"><table><thead><tr>'+headers.map(h=>'<th>'+e(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(c=>'<td>'+e(c)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>';
  const download = (name,text,type="text/plain") => {const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  const normalize = text => String(text).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const words = text => normalize(text).match(/[a-z0-9]{3,}/g)?.filter(w=>!["que","con","para","una","del","los","las","the","and","for","como","por","puedo","necesito","quiero","donde","cual","esta","este","tengo","can","could","please","how","what","with"].includes(w))||[];
  const score = (q,text) => {const a=[...new Set(words(q))],b=new Set(words(text));return a.length?a.filter(w=>b.has(w)).length/a.length:0;};
  async function readFile(file) {
    if(!file) throw Error(t("Choose a file first.","Selecciona un archivo."));
    if(file.size>10*1024*1024) throw Error(t("Maximum file size: 10 MB.","El tamaño máximo es 10 MB."));
    const ext=file.name.split(".").pop().toLowerCase();
    if(ext==="pdf"){
      const pdfjs=await import("./vendor/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc=new URL("./vendor/pdf.worker.mjs",location.href).href;
      const loading=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false});
      const doc=await loading.promise;
      try {if(doc.numPages>60)throw Error(t("This demo accepts PDFs up to 60 pages.","Esta demo admite PDF de hasta 60 páginas."));let text="";for(let i=1;i<=doc.numPages;i++){const page=await doc.getPage(i);const content=await page.getTextContent();text+=content.items.map(x=>x.str).join(" ")+"\n";}if(!text.trim())throw Error(t("This PDF has no extractable text. Use a text PDF.","Este PDF no tiene texto extraíble. Usa un PDF con texto."));return text;}finally{await loading.destroy();}
    }
    if(ext==="docx"){if(!window.mammoth)throw Error("DOCX reader unavailable");return (await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value;}
    if(!["txt","md","csv","json"].includes(ext))throw Error(t("Use PDF, DOCX, TXT or Markdown.","Usa PDF, DOCX, TXT o Markdown."));
    return file.text();
  }
  window.POC_UI={e,t,button,field,input,area,select,notice,table,download,normalize,score,words,readFile,icon,metric,panel};
  window.POC_MODULES=window.POC_MODULES||{};
  const dialog=document.createElement("dialog");dialog.className="poc-dialog wb-dialog";dialog.setAttribute("aria-labelledby","poc-title");document.body.append(dialog);
  const sessions=new Map();let current,opener,busy=false,epoch=0;
  const projectIcons={"azure-agents":"layers","voice-agents":"phone",whatsapp:"message","sales-agents":"car","ticket-triage":"briefcase",interviewer:"user","cloud-interview":"cloud","knowledge-rag":"book","marine-cnn":"activity","bank-delivery":"shield"};
  const tabIcons={setup:"user",interview:"message",history:"clock",cv:"file",roadmap:"route",jobs:"briefcase",help:"book",ask:"search",admin:"upload",index:"layers",conversation:"message",calendar:"calendar",trace:"activity",inbox:"message",knowledge:"database",request:"search",evaluation:"check",dependencies:"layers",incidents:"activity",readiness:"shield",report:"chart",catalog:"car",configure:"layers",dealer:"pin",offer:"wallet",appointments:"calendar",trade:"car",lead:"user",workspace:"briefcase",scope:"book",experiment:"activity",saliency:"chart",pipeline:"route"};
  function render(){
    const {module:m,state:s}=current,u=window.POC_UI;
    const locale=document.documentElement.lang==="es"?"es":"en";
    const p=window.PORTFOLIO_CONTENT[locale].projects.find(x=>x.id===current.id);
    const tabs=m.tabs(s),active=tabs.find(([id])=>id===s.tab)||tabs[0],appIcon=projectIcons[current.id]||"layers";
    dialog.dataset.pocId=current.id;
    dialog.innerHTML='<div class="poc-shell"><header class="poc-header"><div class="wb-app-identity"><span class="wb-app-symbol">'+icon(appIcon)+'</span><div><p class="poc-eyebrow">'+t("Interactive application · local service replay","Aplicación interactiva · servicios simulados")+'</p><h2 id="poc-title">'+e(m.title())+'</h2><p>'+e(p?.title||m.title())+'</p></div></div><div class="wb-header-actions"><span class="wb-live-badge"><i></i>'+t("Demo mode","Modo demo")+'</span><button class="poc-close" type="button" data-action="close" aria-label="'+t("Close","Cerrar")+'">×</button></div></header><div class="wb-layout"><nav class="wb-nav" aria-label="'+t("Demo screens","Pantallas de la demo")+'"><div class="wb-nav-heading">'+t("Workspace","Espacio de trabajo")+'<span>'+tabs.length+'</span></div>'+tabs.map(([id,label])=>'<button type="button" data-action="tab:'+e(id)+'" '+(s.tab===id?'aria-current="page"':'')+'>'+icon(tabIcons[id]||appIcon)+'<span>'+e(label)+'</span>'+(s.tab===id?'<i class="wb-nav-dot"></i>':"")+'</button>').join("")+'<div class="wb-source"><span class="wb-source-icon">'+icon("shield")+'</span><strong>'+t("Local demo","Demo local")+'</strong><p>'+e(m.basis==="cv"?t("Reconstruction from the CV or user description. No original implementation supplied.","Reconstrucción del CV o descripción aportada. Sin implementación original disponible."):t("Workflow based on inspected source code.","Flujo basado en el código revisado."))+'</p><span class="wb-source-status"><i></i>'+t("No token use","Sin consumo de tokens")+'</span></div></nav><div class="wb-content"><div class="wb-breadcrumb">'+icon(appIcon)+'<span>'+e(m.title())+'</span><span aria-hidden="true">/</span><strong>'+e(active[1])+'</strong><span class="wb-origin-tag">'+e(m.basis==="cv"?t("CV reconstruction","Reconstrucci\u00f3n del CV"):t("Based on supplied code","Basado en el c\u00f3digo aportado"))+'</span></div><form id="wb-form">'+m.render(s,u)+'</form><p class="wb-status" role="status">'+(s.message?icon("check")+e(s.message):"")+'</p></div></div><footer class="poc-footer"><span>'+t("Your demo session stays in this browser. External operations are simulated.","La sesión de demostración queda en este navegador. Las operaciones externas están simuladas.")+'</span>'+button(t("Reset session","Reiniciar sesión"),"reset","poc-secondary")+'</footer></div>';
  }
  window.POC_UI.repaint=state=>{if(!dialog.open||current?.state!==state)return false;render();return true;};
  document.addEventListener("click",event=>{
    const launch=event.target.closest("[data-open-poc]");if(!launch)return;
    const id=launch.dataset.openPoc,factory=window.POC_MODULES[id];if(!factory)return;
    event.preventDefault();opener=launch;epoch++;
    const key=id+document.documentElement.lang;
    if(!sessions.has(key)){const module=factory();sessions.set(key,{id,module,state:module.init()});}
    current=sessions.get(key);render();dialog.showModal();dialog.querySelector(".poc-close").focus();
  });
  dialog.addEventListener("submit",event=>event.preventDefault());
  dialog.addEventListener("click",async event=>{
    const control=event.target.closest("[data-action]");if(!control)return;
    const action=control.dataset.action;
    if(action==="close"){dialog.close();return;}
    if(busy)return;
    const s=current.state,m=current.module;
    if(action.startsWith("tab:")){s.tab=action.slice(4);s.message="";render();dialog.querySelector('[aria-current="page"]')?.focus();return;}
    if(action==="reset"){if(!window.confirm(t("Clear this demo session?","¿Borrar esta sesión de demostración?")))return;m.reset?.();current.state=m.init();render();return;}
    const form=dialog.querySelector("form"),values=Object.fromEntries(new FormData(form));const turn=epoch;s.message="";
    busy=true;control.disabled=true;
    try{await m.action(s,action,values,window.POC_UI,form);if(turn===epoch){render();dialog.querySelector('[data-action="'+CSS.escape(action)+'"]')?.focus({preventScroll:true});}}
    catch(error){if(turn===epoch){s.message=error.message;const status=dialog.querySelector(".wb-status");status.classList.add("is-error");status.setAttribute("role","alert");status.textContent=error.message;}}
    finally{busy=false;if(control.isConnected)control.disabled=false;}
  });
  dialog.addEventListener("close",()=>{epoch++;opener?.focus({preventScroll:true});});
})();
