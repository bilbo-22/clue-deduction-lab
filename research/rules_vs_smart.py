import numpy as np, pandas as pd
from sklearn.tree import DecisionTreeRegressor, export_text
df = pd.read_csv('decisions.csv')
df['key'] = df.seed.astype(str) + '-' + df.turn.astype(str)
K = ['S','W','R']
g = df.groupby('key')
df['best_score'] = g.score.transform('max')
df['best'] = (df.score >= df.best_score - 1e-9).astype(int)
df['ratio'] = np.where(df.best_score > 0, df.score / df.best_score, 1.0)
for k in K:
    df[f'{k}_live'] = ((df[f'{k}_cand']==1)&(df[f'{k}_mine']==0)&(df[f'{k}_envyes']==0)).astype(int)
    # how many opponents could still hold it
    df[f'{k}_nposs'] = sum((df[f'{k}_st{o}']!=2).astype(int) for o in [1,2,3]) * (1-df[f'{k}_mine']) * (1-df[f'{k}_heldother'])
    df[f'{k}_pmax'] = df[[f'{k}_p1',f'{k}_p2',f'{k}_p3']].max(axis=1)
df['n_live'] = sum(df[f'{k}_live'] for k in K)
df['n_mine'] = sum(df[f'{k}_mine'] for k in K)
df['n_held'] = sum(df[f'{k}_heldother'] for k in K)
df['n_envyes'] = sum(df[f'{k}_envyes'] for k in K)
for o in [1,2,3]:
    df[f'n_no{o}'] = sum((df[f'{k}_st{o}']==2).astype(int) for k in K)
    df[f'n_yes{o}'] = sum((df[f'{k}_st{o}']==1).astype(int) for k in K)
df['sum_nposs'] = sum(df[f'{k}_nposs'] for k in K)
df['sum_nunk'] = sum(df[f'{k}_nunk'] for k in K)
df['sum_penv'] = sum(df[f'{k}_penv'] for k in K)
# chance that nobody can answer (approx, independence)
df['p_noans'] = np.prod([1 - df[f'{k}_p1'] - df[f'{k}_p2'] - df[f'{k}_p3'] for k in K], axis=0)
print('decisions', df.key.nunique())

keys = np.array(sorted(df.key.unique())); rng = np.random.default_rng(1); rng.shuffle(keys)
train = df.key.isin(keys[:len(keys)//2]); test = ~train

def pick(scores, mask=None):
    m = test if mask is None else mask
    s = pd.Series(scores, index=df.index)[m] + np.random.default_rng(0).random(m.sum())*1e-6
    idx = s.groupby(df.key[m]).idxmax()
    ch = df.loc[idx]
    return ch.ratio.mean()*100, ch.best.mean()*100

def spearman(scores, mask=None):
    m = test if mask is None else mask
    t = pd.DataFrame({'a': pd.Series(scores, index=df.index)[m], 'b': df.score[m], 'k': df.key[m]})
    r = t.groupby('k').apply(lambda x: x.a.rank().corr(x.b.rank()), include_groups=False)
    return r.mean()

print(f"{'rule':52s} {'info':>6s} {'same Q':>7s} {'rank corr':>9s}")
def report(name, sc):
    a, b = pick(sc); print(f'{name:52s} {a:5.1f}% {b:6.1f}% {spearman(sc):9.2f}')
report('Smart', df.score.values)
report('Standard', df['std'].values.astype(float))
report('Count of live cards', df.n_live.values.astype(float))
report('Live cards, then most open cells (sum_nunk)', (df.n_live*100 + df.sum_nunk).values)
report('Live cards, then most possible holders', (df.n_live*100 + df.sum_nposs).values)
report('Live cards, penalise cards held by others', (df.n_live*10 - df.n_held*20 + df.sum_nunk).values)

readable = ['n_live','n_mine','n_held','n_envyes','sum_nposs','sum_nunk'] + [f'n_{v}{o}' for o in [1,2,3] for v in ['no','yes']] + \
   [f'{k}_{f}' for k in K for f in ['live','mine','heldother','st1','st2','st3','nunk','inclue','catsolved','nposs']]
probs = readable + ['sum_penv','p_noans'] + [f'{k}_{f}' for k in K for f in ['penv','p1','p2','p3','pmax']]
for name, feats in [('readable notebook features', readable), ('plus computer probabilities', probs)]:
    for depth in [3, 5, 8, 12]:
        m = DecisionTreeRegressor(max_depth=depth, min_samples_leaf=100, random_state=0).fit(df.loc[train, feats], df.loc[train,'ratio'])
        report(f'tree depth {depth:2d}, {name}', m.predict(df[feats]))
