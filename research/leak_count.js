const E=require('../src/engine.js');
let q=0,leakQ=0,silent=0,silentLeak=0,silentLeakWinNow=0;
for(let s=1;s<=300;s++){const g=E.newGame(s,[3,3,3,3],{ask:Array(4).fill('likelydigits')});
 while(!g.over&&g.turn<200){const me=g.turn%4; // snapshot public NO before the turn
  const pub=new Set();for(let c=0;c<21;c++)if(g.knows.every(k=>k.me===me||k.get(c,me)===2))pub.add(c);
  const n0=g.events.length;E.playTurn(g);const ev=g.events[n0];if(!ev||!ev.suggestion)continue;
  q++;const lk=ev.suggestion.some(c=>pub.has(c)&&!g.hands[me].includes(c));if(lk)leakQ++;
  if(ev.responder<0){silent++;if(lk){silentLeak++;if(g.over&&g.winner===ev.player)silentLeakWinNow++;}}}}
console.log({questions:q,withPublicNoCard:(leakQ/q*100).toFixed(1)+'%',silentAnswers:silent,silentWithLeak:silentLeak,askerWonThatTurn:silentLeakWinNow});
