export function jointAngle(a,b,c,aspect=1){
  if(![a,b,c].every(p=>p && Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.visibility??0)>=0.65)) return null;
  const u=[(a.x-b.x)*aspect,a.y-b.y],v=[(c.x-b.x)*aspect,c.y-b.y];
  const d=Math.hypot(...u)*Math.hypot(...v);if(d<0.0001)return null;
  return Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/d)))*180/Math.PI;
}
export function validatePlan(p){
  return p&&['left','right'].includes(p.side)&&['flexion','extension'].includes(p.exercise)&&
  Number.isFinite(p.low)&&Number.isFinite(p.high)&&p.low>=20&&p.high<=180&&p.high-p.low>=25&&
  Number.isInteger(p.reps)&&p.reps>=1&&p.reps<=30&&Number.isInteger(p.sets)&&p.sets>=1&&p.sets<=5&&
  Number.isInteger(p.rest)&&p.rest>=5&&p.rest<=180&&typeof p.instructions==='string'&&p.instructions.length<=500;
}
export class RepCounter{
  constructor(plan){this.plan=plan;this.count=0;this.reset();}
  reset(){this.phase='start';this.filtered=null;this.since=null;this.last=null;}
  update(raw,t){
    if(raw===null||!Number.isFinite(raw)){this.reset();return false;}
    if(this.last!==null&&t-this.last>500)this.reset();this.last=t;
    this.filtered=this.filtered===null?raw:this.filtered*0.65+raw*0.35;
    const flex=this.plan.exercise==='flexion';
    const atStart=flex?this.filtered>=this.plan.high:this.filtered<=this.plan.low;
    const atTarget=flex?this.filtered<=this.plan.low:this.filtered>=this.plan.high;
    const hit=this.phase==='target'?atTarget:atStart;
    if(!hit){this.since=null;return false;}if(this.since===null)this.since=t;
    if(t-this.since<250)return false;this.since=null;
    if(this.phase==='start'){this.phase='target';return false;}
    if(this.phase==='target'){this.phase='return';return false;}
    this.phase='target';this.count++;return true;
  }
}
export const defaultPlan={version:1,exercise:'flexion',side:'right',low:65,high:145,reps:5,sets:2,rest:20,instructions:'Sample program for demonstrating the game. These targets are not a personal rehabilitation prescription.'};
