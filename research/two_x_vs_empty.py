import numpy as np, pandas as pd
df = pd.read_csv('decisions.csv'); df['key']=df.seed.astype(str)+'-'+df.turn.astype(str)
df['best']=df.score>=df.groupby('key').score.transform('max')-1e-9
out=[]
for k,lo,hi,col,other in [('S',0,6,'s',['w','r']),('W',6,12,'w',['s','r']),('R',12,21,'r',['s','w'])]:
    live=(df[f'{k}_cand']==1)&(df[f'{k}_mine']==0)&(df[f'{k}_envyes']==0)
    x=sum((df[f'{k}_st{o}']==2).astype(int) for o in [1,2,3])
    df['x']=x; df['live']=live
    # Smart's other two cards per decision
    sm=df[df.best].groupby('key').first()[other]
    d=df.join(sm, on='key', rsuffix='_sm')
    same=(d[other[0]]==d[other[0]+'_sm'])&(d[other[1]]==d[other[1]+'_sm'])&d.live
    d=d[same]
    for xa,xb in [(2,0),(2,1),(1,0)]:
        a=d[d.x==xa].groupby('key').agg(sa=('score','mean'),pa=(f'{k}_penv','mean'))
        b=d[d.x==xb].groupby('key').agg(sb=('score','mean'),pb=(f'{k}_penv','mean'))
        j=a.join(b,how='inner')
        if len(j): out.append(dict(cat=k,compare=f'{xa} X vs {xb} X',decisions=len(j),better=f"{(j.sa>j.sb).mean()*100:.0f}%",info_ratio=f"{(j.sa.mean()/j.sb.mean()):.2f}x",p_env=f"{j.pa.mean()*100:.0f}% vs {j.pb.mean()*100:.0f}%"))
print(pd.DataFrame(out).to_string(index=False))
# which opponent still could hold the 2-X card: first, second or third in line
d=df.copy(); k='S'
d['x']=sum((d[f'{k}_st{o}']==2).astype(int) for o in [1,2,3]); d['live']=(d[f'{k}_cand']==1)&(d[f'{k}_mine']==0)&(d[f'{k}_envyes']==0)
sm=d[d.best].groupby('key').first()[['w','r']]; d=d.join(sm,on='key',rsuffix='_sm'); d=d[(d.w==d.w_sm)&(d.r==d.r_sm)&d.live]
e=d[d.x==0].groupby('key').score.mean()
for o,name in [(1,'next player'),(2,'second player'),(3,'last player')]:
    two=d[(d.x==2)&(d[f'{k}_st{o}']!=2)].groupby('key').score.mean()
    j=pd.concat([two.rename('a'),e.rename('b')],axis=1).dropna()
    if len(j): print(f'suspect with 2 X, still possible only for the {name}: beats an empty line in {(j.a>j.b).mean()*100:.0f}% of {len(j)} decisions, {j.a.mean()/j.b.mean():.2f}x the information')
