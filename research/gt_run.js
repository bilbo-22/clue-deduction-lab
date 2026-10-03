// node gt_run.js <focal> <opp or a,b,c> <firstSeed> <n>  -> prints "focal opp wins games"
const E=require('../src/engine.js');
const [focal,opp,first,n]=[process.argv[2],process.argv[3],+process.argv[4],+process.argv[5]];
const opps=opp.split(',');
let w=0,g=0;
for(let s=first;s<first+n;s++)for(let p=0;p<4;p++){const ask=[];let j=s;for(let q=0;q<4;q++)ask[q]=q===p?focal:opps[(j++)%opps.length];if(E.runGame(s,[3,3,3,3],{ask}).winner===p)w++;g++;}
console.log(focal,opp,w,g);
