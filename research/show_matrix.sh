# show_matrix.sh <ask> <level> <deals> <policies...>
ask=$1; lv=$2; D=$3; shift 3
for pol in "$@"; do
  for i in $(seq 1 8); do node $(dirname $0)/show_run.js $pol $ask $lv $D $i 8 > ${TMPDIR:-/tmp}/sh_${pol}_$i.json & done; wait
  cat ${TMPDIR:-/tmp}/sh_${pol}_*.json | node -e 'let w=0,n=0,t=0;require("fs").readFileSync(0,"utf8").trim().split("\n").forEach(l=>{const o=JSON.parse(l);w+=o.w;n+=o.n;t+=o.turns});console.log(process.argv[1].padEnd(8),(w/n*100).toFixed(1)+"%","games",n,"avg turns",(t/n).toFixed(2))' $pol
done
