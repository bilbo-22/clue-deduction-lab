const E=require('../src/engine.js');const C=E.CARDS;
const [seed,turn,s,w,r]=process.argv.slice(2).map(Number);
const g=E.newGame(seed,[3,3,3,3],{ask:['envgoal','envgoal','envgoal','envgoal']});
let done=false;
g.onDecide=(K,me,game)=>{ if(game.turn!==turn||done)return; done=true;
 const opp=[1,2,3].map(i=>(me+i)%4), N=n=>'P'+(n+1), st=v=>['?','✓','X'][v];
 let a=99;const rng=()=>{a=(a*1103515245+12345)%2147483648;return a/2147483648;};
 const S=[];for(let i=0;i<1500;i++){const x=K.search(-1,-1,rng);if(x)S.push(Array.from(x));}
 const pEnv=c=>S.filter(o=>o[c]===4).length/S.length;
 console.log(`== deal ${seed}, turn ${turn}, asker ${N(me)}, answer order ${opp.map(N).join(' > ')}`);
 const rowOf=c=>`${C[c].padEnd(13)} ${opp.map(o=>N(o)+':'+st(K.get(c,o))).join(' ')} Env:${st(K.get(c,4))}  P(env)=${(pEnv(c)*100).toFixed(0)}%`+ (K.clauses.filter(cl=>!cl.done&&cl.cards.includes(c)).map(cl=>`  clue#${cl.id}(${N(cl.p)}: ${cl.cards.map(x=>C[x]).join('/')})`).join(''));
 const likely=[[0,6],[6,12],[12,21]].map(([lo,hi])=>{let sol=-1;for(let c=lo;c<hi;c++)if(K.get(c,4)===1)sol=c;if(sol>=0)return null;let best=-1,pool=[];for(let c=lo;c<hi;c++){if(K.get(c,4)===2)continue;let x=0;for(const o of opp)if(K.get(c,o)===2)x++;if(x>best){best=x;pool=[c]}else if(x===best)pool.push(c);}return pool;});
 console.log('candidates per category:',[[0,6],[6,12],[12,21]].map(([lo,hi])=>{const l=[];for(let c=lo;c<hi;c++)if(K.get(c,4)!==2)l.push(C[c]);return l.join(', ')}).join(' | '));
 const smart=[s,w,r];
 const mostx=likely.map((p,k)=>p?p[0]:smart[k]);
 console.log('Smart asks: ',smart.map(c=>C[c]).join(' / '));
 console.log('Most-X asks:',likely.map(p=>p?p.map(c=>C[c]).join(' or '):'(solved)').join(' / '));
 const show=new Set([...smart,...likely.flat().filter(x=>x!=null)]);
 for(const c of show) console.log('  '+rowOf(c));
 const H=m=>{let t=0,h=0;for(const v of m.values())t+=v;for(const v of m.values()){const f=v/t;h-=f*Math.log2(f)}return h;};
 const env=o=>o.map((l,c)=>l===4?c:'').join('.');
 const all=new Map();S.forEach(o=>all.set(env(o),(all.get(env(o))||0)+1));
 const analyse=q=>{const gr=new Map();for(const o of S){let key='nobody answers';for(const p of opp){const has=q.filter(c=>o[c]===p);if(has.length){key=N(p)+' shows '+(has.length>1?has.map(c=>C[c]).join('|'):C[has[0]]);break;}}if(!gr.has(key))gr.set(key,new Map());const m=gr.get(key);m.set(env(o),(m.get(env(o))||0)+1);}
  let exp=0;const rows=[];for(const[k,m]of gr){let n=0;for(const v of m.values())n+=v;exp+=n/S.length*H(m);rows.push([k,n/S.length,Math.pow(2,H(m))]);}rows.sort((x,y)=>y[1]-x[1]);return{left:Math.pow(2,exp),rows};};
 console.log(`envelope now ~${Math.pow(2,H(all)).toFixed(0)} effective answers`);
 for(const [name,q] of [['Smart',smart],['Most-X',mostx]]){const a=analyse(q);console.log(`${name} (${q.map(c=>C[c]).join('/')}): ~${a.left.toFixed(1)} left on average`);a.rows.slice(0,6).forEach(([k,p,l])=>console.log(`     ${(p*100).toFixed(0).padStart(3)}%  ${k.padEnd(34)} -> ~${l.toFixed(1)} left`));}
};
while(!g.over&&!done)E.playTurn(g);
