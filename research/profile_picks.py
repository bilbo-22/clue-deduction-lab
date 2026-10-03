import numpy as np, pandas as pd
df = pd.read_csv('decisions.csv'); df['key']=df.seed.astype(str)+'-'+df.turn.astype(str)
K=['S','W','R']
df['best']=(df.score>=df.groupby('key').score.transform('max')-1e-9)
for k in K: df[f'{k}_live']=((df[f'{k}_cand']==1)&(df[f'{k}_mine']==0)&(df[f'{k}_envyes']==0)).astype(int)
f={}
f['live cards named (could be the answer)']=sum(df[f'{k}_live'] for k in K)
f['own cards named']=sum(df[f'{k}_mine'] for k in K)
f['solved envelope card named']=sum(df[f'{k}_envyes'] for k in K)
f['cards someone else is known to hold']=sum(df[f'{k}_heldother'] for k in K)
for o,n in [(1,'next player'),(2,'2nd player'),(3,'3rd player')]:
    f[f'cards with X for {n}']=sum((df[f'{k}_st{o}']==2).astype(int) for k in K)
f['cards in an open clue']=sum((df[f'{k}_inclue']>0).astype(int) for k in K)
f['chance in envelope, summed (computer)']=sum(df[f'{k}_penv'] for k in K)
f['chance next player holds one (computer)']=1-np.prod([1-df[f'{k}_p1'] for k in K],axis=0)
f['chance nobody can answer (computer)']=np.prod([1-df[f'{k}_p1']-df[f'{k}_p2']-df[f'{k}_p3'] for k in K],axis=0)
F=pd.DataFrame(f); F['key']=df.key
rows=[]
for name,mask in [('Smart picks',df.best.values),('Standard picks',df['std'].values==1),('All 324 questions',np.ones(len(df),bool))]:
    sub=F[mask].groupby('key').mean(numeric_only=True).mean()
    rows.append(sub.rename(name))
print(pd.concat(rows,axis=1).round(2).to_string())
