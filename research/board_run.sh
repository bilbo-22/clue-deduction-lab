#!/bin/bash
# Usage: research/board_run.sh <config> <deals> <dice> <procs> -> merged JSON on stdout
cfg=$1; deals=$2; dice=$3; P=${4:-4}
for i in $(seq 1 $P); do node "$(dirname "$0")/board_sim.js" $cfg $deals $dice $i $P $FLOOR > /tmp/claude-1000/bs_${cfg}_${dice}_$i.json & done; wait
node -e '
const fs=require("fs");const P=+process.argv[1],cfg=process.argv[2],dice=process.argv[3];
const m={turns:[],wins:[],wrong:0,n:0,noWin:0,seatWins:[0,0,0,0]};
for(let i=1;i<=P;i++){const o=JSON.parse(fs.readFileSync(`/tmp/claude-1000/bs_${cfg}_${dice}_${i}.json`));m.turns.push(...o.turns);m.wins.push(...o.wins);m.wrong+=o.wrong;m.n+=o.n;m.noWin+=o.noWin;if(o.seatWins)o.seatWins.forEach((x,k)=>m.seatWins[k]+=x);}
const t=[...m.turns].sort((a,b)=>a-b),n=t.length,q=f=>t[Math.min(n-1,Math.ceil(f*n)-1)];
const r={cfg,dice,games:n,mean:+(t.reduce((a,b)=>a+b,0)/n).toFixed(2),median:q(.5),p95:q(.95),max:t[n-1],wrong:m.wrong,noWin:m.noWin};
if(/1$/.test(cfg))r.specialWinRate=+(m.wins.reduce((a,b)=>a+b,0)/n*100).toFixed(1),r.seatWinRates=m.seatWins.map(x=>+(x/(n/4)*100).toFixed(1));
else{const w=[0,0,0,0];m.wins.forEach(x=>w[x]++);r.seatWinRates=w.map(x=>+(x/n*100).toFixed(1));}
console.log(JSON.stringify(r));' $P $cfg $dice
