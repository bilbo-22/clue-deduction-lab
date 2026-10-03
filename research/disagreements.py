import numpy as np, pandas as pd
df = pd.read_csv('decisions.csv'); df['key']=df.seed.astype(str)+'-'+df.turn.astype(str)
K=['S','W','R']
df['bestscore']=df.groupby('key').score.transform('max')
for k in K:
    df[f'{k}_x']=sum((df[f'{k}_st{o}']==2).astype(int) for o in [1,2,3])
    df[f'{k}_live']=((df[f'{k}_cand']==1)&(df[f'{k}_mine']==0)&(df[f'{k}_envyes']==0)).astype(int)
# Is each slot a valid "most X's" choice? unsolved category: live card with max X among live; solved: own card, else solved env card
ok = np.ones(len(df),bool)
for k in K:
    solved = df[f'{k}_catsolved']==1
    # max X among live cards of that category within decision: compute per decision per category
    live = df[f'{k}_live']==1
    mx = df[live].groupby('key')[f'{k}_x'].max()
    df[f'{k}_mx'] = df.key.map(mx)
    unsolved_ok = live & (df[f'{k}_x']==df[f'{k}_mx'])
    has_own = df.groupby('key')[f'{k}_mine'].transform('max')==1
    solved_ok = np.where(has_own, df[f'{k}_mine']==1, df[f'{k}_envyes']==1)
    ok &= np.where(solved, solved_ok, unsolved_ok)
df['likely_ok']=ok
lk = df[df.likely_ok].groupby('key').score.agg(['mean','max'])
best = df[df.score>=df.bestscore-1e-9].groupby('key').first()
res = best.join(lk)
res['gap']=(res.bestscore-res['mean'])/res.bestscore
res['agree']=res['max']>=res.bestscore-1e-9
print('decisions',len(res),'| "most X" choice set contains Smart pick:',f"{res.agree.mean()*100:.1f}%",'| info of most-X pick vs Smart:',f"{(res['mean']/res.bestscore).mean()*100:.1f}%")
# For disagreements, describe how Smart's pick differs per slot
dis = best[~res.agree]
print('disagreements',len(dis))
summ = {}
for k,cat in zip(K,['suspect','weapon','room']):
    sub = dis
    notmax = (sub[f'{k}_live']==1)&(sub[f'{k}_x']<sub[f'{k}_mx'])&(sub[f'{k}_catsolved']==0)
    own_unsolved = (sub[f'{k}_mine']==1)&(sub[f'{k}_catsolved']==0)
    known_ans_unsolved = (sub[f'{k}_cand']==0)&(sub[f'{k}_mine']==0)&(sub[f'{k}_catsolved']==0)
    solved_live = (sub[f'{k}_catsolved']==1)&(sub[f'{k}_mine']==0)&(sub[f'{k}_envyes']==0)
    summ[cat]=dict(fewer_X_live=notmax.mean(), own_card_in_unsolved=own_unsolved.mean(), card_known_not_answer=known_ans_unsolved.mean(), in_open_clue=((sub[f'{k}_inclue']>0)&notmax).mean())
print((pd.DataFrame(summ)*100).round(1).to_string())
print(res.sort_values('gap',ascending=False).head(12)[['seed','turn','me','s','w','r','gap']].to_string())
