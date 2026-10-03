# usage: gt_matrix.sh <opp> <n> <focal...>  ; splits seeds into 8 chunks per focal
opp=$1; n=$2; shift 2
for f in "$@"; do for c in 0 1 2 3 4 5 6 7; do echo "$f $opp $((1+c*n/8)) $((n/8))"; done; done | xargs -P 8 -L 1 node $(dirname $0)/gt_run.js | awk '{w[$1]+=$3; g[$1]+=$4} END {for (k in w) printf "%-14s %5.1f%%\n", k, 100*w[k]/g[k]}' | sort
