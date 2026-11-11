const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
function load(){
  const dialog={setAttribute(){},addEventListener(){},open:false};
  const document={documentElement:{lang:"en"},createElement:()=>dialog,body:{append(){}},addEventListener(){}};
  const context={document,window:{},console,setTimeout,URL,Blob};
  vm.createContext(context);
  for(const name of ["poc-shell","poc-interview","poc-knowledge","poc-operations","poc-sales","poc-research"]){
    vm.runInContext(fs.readFileSync(path.join(__dirname,"../"+name+".js"),"utf8"),context);
  }
  context.window.POC_UI.repaint=()=>false;
  return context.window;
}
test("voice reservations recheck changed slots and reject conflicts",()=>{
  const w=load(),m=w.POC_MODULES["voice-agents"](),s=m.init(),u=w.POC_UI;
  const v={task:"Appointment",day:"Tuesday",time:"18:00",guests:"2",issue:"Consultation"};
  m.action(s,"start",v,u);m.action(s,"next",v,u);m.action(s,"next",v,u);
  assert.equal(s.stage,3);
  m.action(s,"next",{...v,time:"12:00"},u);
  assert.equal(s.stage,2);assert.equal(s.bookings.length,0);
  m.action(s,"next",{...v,time:"12:00"},u);assert.equal(s.stage,2);
  m.action(s,"next",v,u);m.action(s,"next",v,u);assert.equal(s.bookings.length,1);
  m.action(s,"cancel",{cancelId:"DEMO-001"},u);assert.equal(s.bookings[0].cancelled,true);
});
test("commercial appointments preserve checked values and reuse lead IDs",()=>{
  const w=load(),m=w.POC_MODULES["sales-agents"](),s=m.init(),u=w.POC_UI;
  const v={kind:"Live video",day:"Thursday",time:"17:00"};
  m.action(s,"availability",v,u);assert.equal(s.pending.day,"Thursday");
  assert.throws(()=>m.action(s,"book",{...v,time:"12:00"},u));
  m.action(s,"book",v,u);assert.equal(s.slots.length,1);
  m.action(s,"availability",v,u);assert.equal(s.available,false);
  m.action(s,"lead",{name:"Sample",email:"sample@example.invalid",channel:"Email"},u);
  const id=s.lead.id;m.action(s,"lead",{name:"Edited",email:"edited@example.invalid",channel:"Phone"},u);
  assert.equal(s.lead.id,id);assert.equal(s.lead.name,"Edited");
  m.action(s,"finance",{deposit:"4000",rate:"0",months:"24"},u);
  assert.equal(s.finance.monthly,20000/24);
});
test("document reset removes answerable context and prevents invented answers",async()=>{
  const w=load(),m=w.POC_MODULES["knowledge-rag"](),s=m.init(),u=w.POC_UI;
  await m.action(s,"ask",{question:"solicitudes acceso recurso"},u);
  assert.ok(s.reply.sources.length>0);
  await m.action(s,"clear",{},u);
  await m.action(s,"ask",{question:"solicitudes acceso recurso"},u);
  assert.equal(s.reply.sources.length,0);
  assert.match(s.reply.answer,/do not contain/);
});
test("messaging follows DB, RAG and domain fallback without generic-word false matches",()=>{
  const w=load(),m=w.POC_MODULES.whatsapp(),s=m.init(),u=w.POC_UI;
  m.action(s,"example:password",{},u);assert.equal(s.trace.at(-1).route,"DB");
  m.action(s,"example:geo",{},u);assert.equal(s.trace.at(-1).route,"RAG");
  m.action(s,"example:outside",{},u);assert.equal(s.trace.at(-1).route,"Domain guard");
  m.action(s,"approve",{review:"Reviewed response"},u);
  m.action(s,"example:outside",{},u);assert.equal(s.trace.at(-1).route,"DB");
});
test("delivery requires every dependency and reopening invalidates readiness",()=>{
  const w=load(),m=w.POC_MODULES["bank-delivery"](),s=m.init(),u=w.POC_UI;
  assert.throws(()=>m.action(s,"release",{},u));
  for(let i=0;i<6;i++)m.action(s,"gate:"+i,{},u);
  m.action(s,"release",{},u);assert.equal(s.deployed,true);
  m.action(s,"gate:2",{},u);assert.equal(s.deployed,false);
});
test("interview validates phases, retains history and finishes after six responses",async()=>{
  const w=load(),m=w.POC_MODULES.interviewer(),s=m.init(),u=w.POC_UI;
  await m.action(s,"start",{cv:"Python RAG",role:"Engineer",salary:"30000",type:"Technical"},u);
  await assert.rejects(()=>m.action(s,"answer",{phase0:"Example"},u));
  for(let i=0;i<6;i++)await m.action(s,"answer",{phase0:"Situation",phase1:"Task",phase2:"Test action",phase3:"Result 25%"},u);
  assert.equal(s.answers.length,6);assert.equal(s.finished,true);assert.equal(s.tab,"roadmap");
});
