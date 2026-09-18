import test from 'node:test';import assert from 'node:assert/strict';
import handler from '../api/rehab.js';import {defaultPlan} from '../public/motion.js';
test('connected demo enforces roles, snapshots, report deduplication and email status',async()=>{
 const original=globalThis.fetch,env={...process.env},db=new Map(),index=new Map();let emailCalls=0,mailFailure=false;
 Object.assign(process.env,{AUTH_SECRET:'test-secret-00000000000000000000000000',UPSTASH_REDIS_REST_URL:'https://redis.test',UPSTASH_REDIS_REST_TOKEN:'test',PATIENT_ACCESS_CODE:'patient-demo-secret',THERAPIST_ACCESS_CODE:'therapist-demo-secret',RESEND_API_KEY:'test',EMAIL_FROM:'demo@example.test',THERAPIST_EMAIL:'therapist@example.test',APP_URL:'https://demo.example.test'});
 globalThis.fetch=async(url,options)=>{if(url==='https://api.resend.com/emails'){emailCalls++;if(mailFailure)throw new Error('Simulated email outage');const payload=JSON.parse(options.body);assert.equal(payload.to[0],'therapist@example.test');assert.equal(payload.text.includes('reps'),false);assert.ok(options.headers['Idempotency-Key']);return {ok:true,json:async()=>({id:'email-test'})}}
 assert.equal(url,'https://redis.test');const [cmd,k,v,...rest]=JSON.parse(options.body);let result=null;
 if(cmd==='GET')result=db.get(k)||null;
 else if(cmd==='SET'){if(!rest.includes('NX')||!db.has(k)){db.set(k,v);result='OK'}}
 else if(cmd==='INCR'){result=Number(db.get(k)||0)+1;db.set(k,String(result))}
 else if(cmd==='EXPIRE')result=1;
 else if(cmd==='DEL')result=db.delete(k)?1:0;
 else if(cmd==='ZADD'){index.set(rest[0],Number(v));result=1}
 else if(cmd==='ZREVRANGE')result=[...index.keys()];else throw new Error('Unhandled '+cmd);
 return {ok:true,json:async()=>({result})};};
 const call=async(action,body,cookie,origin='https://demo.example.test')=>{let status=200,result,headers={};const req={url:'/api/rehab?action='+action,method:body?'POST':'GET',headers:{host:'demo.example.test',origin,'content-type':'application/json',cookie:cookie||''},body,socket:{remoteAddress:'test'}};const res={setHeader:(k,v)=>headers[k]=v,status:n=>{status=n;return res},json:d=>{result=d;return res}};await handler(req,res);return {status,result,headers}};
 try{
 assert.equal((await call('data')).status,401);
 const p=await call('login',{role:'patient',code:'patient-demo-secret'}),t=await call('login',{role:'therapist',code:'therapist-demo-secret'});assert.equal(p.status,200);const pc=p.headers['Set-Cookie'],tc=t.headers['Set-Cookie'];assert.ok(pc.includes('HttpOnly'));assert.ok(pc.includes('SameSite=Strict'));
 assert.equal((await call('plan',defaultPlan,pc)).status,403);
 assert.equal((await call('plan',defaultPlan,tc,'https://evil.test')).status,403);
 assert.equal((await call('plan',{...defaultPlan,low:150},tc)).status,400);
 const saved=await call('plan',{...defaultPlan,reps:2},tc);assert.equal(saved.result.plan.version,2);
 const s={id:'11111111-1111-4111-8111-111111111111',source:'simulation',plan:saved.result.plan,reps:1,completed:false,activeSeconds:10,coverage:100,min:50,max:160,startedAt:new Date(Date.now()-20000).toISOString(),endedAt:new Date().toISOString()};
 assert.equal((await call('session',s,tc)).status,403);
 assert.equal((await call('session',{...s,plan:{...s.plan,reps:10}},pc)).status,400);
 const first=await call('session',s,pc);assert.equal(first.status,200);assert.equal(first.result.notification,'accepted');assert.equal(emailCalls,1);
 await call('session',s,pc);assert.equal(emailCalls,1);
 await call('plan',{...defaultPlan,reps:3},tc);
 const data=await call('data',undefined,tc);assert.equal(data.result.sessions.length,1);assert.equal(data.result.sessions[0].plan.reps,2);assert.equal(data.result.plan.reps,3);
 mailFailure=true;const failedEmail=await call('session',{...s,id:'22222222-2222-4222-8222-222222222222'},pc);assert.equal(failedEmail.status,200);assert.equal(failedEmail.result.saved,true);assert.equal(failedEmail.result.notification,'failed');assert.equal((await call('data',undefined,tc)).result.sessions.length,2);
 }finally{globalThis.fetch=original;for(const k of Object.keys(process.env))if(!(k in env))delete process.env[k];Object.assign(process.env,env)}
});
