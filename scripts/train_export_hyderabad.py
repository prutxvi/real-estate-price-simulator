"""Train Hyderabad models, export JSON artifacts for the Next.js app (₹ millions scale)."""
import json, base64
import numpy as np, pandas as pd
import statsmodels.api as sm
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import r2_score, mean_squared_error

ROOT = "/Users/pruthvi/Projects/real-estate-price-simulator"
WEB  = f"{ROOT}/web"
import os
os.makedirs(f"{WEB}/lib/models", exist_ok=True)
os.makedirs(f"{WEB}/lib/data", exist_ok=True)
os.makedirs(f"{WEB}/public/data", exist_ok=True)

df = pd.read_csv(f"{ROOT}/data/hyderabad_clean.csv")
rng = np.random.default_rng(42)

FEATS = ["area","bedrooms","resale","pool","gym","clubhouse","security","backup","car_parking","lift","vaastu"]
PRICE_SCALE = 1e6  # work in INR millions
LOC_PREFIX = "loc_"

train, test = train_test_split(df, test_size=0.2, random_state=42)
Xt, Xv = train[FEATS].astype(float), test[FEATS].astype(float)
yt, yv = train["price"].values / PRICE_SCALE, test["price"].values / PRICE_SCALE

# 1) SIMPLE: area only
Xs_t = sm.add_constant(Xt[["area"]]); Xs_v = sm.add_constant(Xv[["area"]])
ms = sm.OLS(yt, Xs_t).fit()
rs = r2_score(yv, ms.predict(Xs_v)); rmse_s = mean_squared_error(yv, ms.predict(Xs_v)) ** 0.5 * PRICE_SCALE

# 2) MULTI: 11 numeric features
Xm_t = sm.add_constant(Xt); Xm_v = sm.add_constant(Xv)
mm = sm.OLS(yt, Xm_t).fit()
rm = r2_score(yv, mm.predict(Xm_v)); rmse_m = mean_squared_error(yv, mm.predict(Xm_v)) ** 0.5 * PRICE_SCALE

# 3) FULL: numeric + locality dummies
lt  = pd.get_dummies(train["loc_n"].astype(str), prefix="loc", drop_first=True).astype(float)
lv  = pd.get_dummies(test["loc_n"].astype(str), prefix="loc", drop_first=True).astype(float)
lv  = lv.reindex(columns=lt.columns, fill_value=0)
Xf_t = pd.concat([Xt, lt], axis=1); Xf_v = pd.concat([Xv, lv], axis=1)
mf  = sm.OLS(yt, sm.add_constant(Xf_t)).fit()
pf = mf.predict(sm.add_constant(Xf_v))
rf = r2_score(yv, pf); rmse_f = mean_squared_error(yv, pf) ** 0.5 * PRICE_SCALE

# 4) MLP (11 numeric, standardized)
mu, sd = Xt.mean(), Xt.std().replace(0, 1)
Zt = (Xt - mu) / sd; Zv = (Xv - mu) / sd
mlp = MLPRegressor(hidden_layer_sizes=(32, 16), activation="relu", solver="adam",
                   max_iter=1200, early_stopping=True, n_iter_no_change=20,
                   random_state=42, tol=1e-5)
mlp.fit(Zt, yt)
pm = mlp.predict(Zv)
r_mlp = r2_score(yv, pm); rmse_mlp = mean_squared_error(yv, pm) ** 0.5 * PRICE_SCALE

print(f"holdout: area-only     R2={rs:.4f} RMSE=Rs{rmse_s:,.0f}")
print(f"holdout: multi(11)     R2={rm:.4f} RMSE=Rs{rmse_m:,.0f}")
print(f"holdout: +location     R2={rf:.4f} RMSE=Rs{rmse_f:,.0f}")
print(f"holdout: MLP(11)       R2={r_mlp:.4f} RMSE=Rs{rmse_mlp:,.0f}")

def j(x): return json.dumps(x, separators=(",", ":"))

names = ["const"] + FEATS + list(lt.columns)
coefs = mf.params.values
means = np.r_[1.0, pd.concat([Xt, lt], axis=1).mean().values]
stds  = np.r_[np.ones(1), sd.values, np.sqrt((lt == 1).mean().values * (1 - (lt == 1).mean().values))]

lin10 = {
    "params": {str(k): float(v) for k, v in mm.params.items()},
    "pvalues": {str(k): float(v) for k, v in mm.pvalues.items()},
    "bse": {str(k): float(v) for k, v in mm.bse.items()},
    "tvalues": {str(k): float(v) for k, v in mm.tvalues.items()},
    "fvalue": float(mm.fvalue), "f_pvalue": float(mm.f_pvalue),
    "adj_r2": float(mm.rsquared_adj), "r2": float(mm.rsquared),
    "nobs": int(mm.nobs), "df_resid": int(mm.df_resid),
}
linear = {
    "lin10": lin10, "features": FEATS, "price_scale": PRICE_SCALE,
    "names": names, "coefs": coefs.tolist(), "means": means.tolist(), "stds": stds.tolist(),
    "intercept": float(mf.params["const"]),
    "r2_train": float(mf.rsquared), "r2_holdout": float(rf), "rmse_holdout": float(rmse_f),
    "zip_prefix": LOC_PREFIX,
}
open(f"{WEB}/lib/models/linear.json", "w").write(j(linear))

mlp_export = {
    "features": FEATS, "price_scale": PRICE_SCALE,
    "means": mu.tolist(), "stds": sd.tolist(),
    "coefs": [w.tolist() for w in mlp.coefs_], "intercepts": [b.tolist() for b in mlp.intercepts_],
    "r2_holdout": float(r_mlp), "rmse_holdout": float(rmse_mlp),
    "train_samples": int(len(Xt)), "test_samples": int(len(Xv)),
}
open(f"{WEB}/lib/models/mlp.json", "w").write(j(mlp_export))

# ---- city map (display names come from prep) ----
g = df.groupby("loc_n")
city_map = {}
for n, sub in g:
    row = sub.iloc[0]
    display = row["location"]
    city_map[display] = {
        "location": display, "city": display, "key": str(n),
        "median_price": float(sub["price"].median()), "n": int(len(sub)),
        "lat": float(row["lat"]), "long": float(row["long"]),
    }
open(f"{WEB}/lib/data/city_map.json", "w").write(j(city_map))

# ---- houses for map + similar ----
houses = df[["id","price","area","bedrooms","resale","pool","gym","clubhouse","security","backup",
             "car_parking","lift","vaastu","location","lat","long"]].copy()
open(f"{WEB}/public/data/houses.json", "w").write(j(houses.to_dict(orient="records")))
print("houses.json rows:", len(houses))

# ---- kNN index: standardized numeric features ----
Zall = ((df[FEATS].astype(float) - mu) / sd).values.astype(np.float32)
open(f"{WEB}/public/data/norm_matrix.b64", "w").write(base64.b64encode(Zall.tobytes()).decode())
open(f"{WEB}/public/data/norm_matrix.meta.json", "w").write(j({
    "features": FEATS, "rows": int(len(df)), "n_features": len(FEATS),
    "dtype": "float32", "order": "row-major",
}))

# ---- residuals (full model, holdout) ----
resid = (yv - pf.values) * PRICE_SCALE
fitted = pf.values * PRICE_SCALE
samp = np.random.default_rng(7).choice(len(resid), size=min(3000, len(resid)), replace=False)
qq_x = np.sort(resid); qq_y = np.sort(np.random.default_rng(1).normal(0, resid.std(), size=len(resid)))
residuals = {"sample": [{"fitted": float(fitted[i]), "resid": float(resid[i])} for i in sorted(samp)],
             "qq": [{"x": float(qq_x[i]), "y": float(qq_y[i])} for i in range(0, len(qq_x), max(1, len(qq_x)//400))]}
open(f"{WEB}/public/data/residuals.json", "w").write(j(residuals))

# ---- stats ----
bins = np.arange(0, 170, 10) * 1e6
hist = pd.cut(df["price"], bins=bins).value_counts().sort_index()
hist_price = [{"lower": float(float(str(b).split(",")[0].strip("()[]"))), "count": int(c)} for b, c in hist.items()]
loc_price = (df.groupby("loc_n")["price"].agg(["median", "count"])
             .sort_values("median", ascending=False).head(25)
             .reset_index())
loc_price["city"] = loc_price["loc_n"].map(dict(zip(df["loc_n"], df["location"])))
scatter = df.sample(n=min(3000, len(df)), random_state=3)[["area", "bedrooms", "price"]]
num_feats = FEATS + ["price"]
corr = df[num_feats].corr()
corr_matrix = {col: {row: float(corr.loc[row, col]) for row in num_feats} for col in num_feats}
corr_price = {k: float(corr.loc["price", k]) for k in FEATS}
holdout = [
    {"name": "Area only", "r2": float(rs), "rmse": float(rmse_s)},
    {"name": "+ BHK & amenities", "r2": float(rm), "rmse": float(rmse_m)},
    {"name": "+ locality", "r2": float(rf), "rmse": float(rmse_f)},
    {"name": "Neural net", "r2": float(r_mlp), "rmse": float(rmse_mlp)},
]
stats = {
    "hist_price": hist_price,
    "loc_price": loc_price[["city", "median", "count"]].rename(columns={"median": "median_price", "count": "n"}).to_dict(orient="records"),
    "city_stats": city_map,
    "scatter": scatter.to_dict(orient="records"),
    "corr": corr_price,
    "corr_matrix": corr_matrix,
    "price": {"mean": float(df["price"].mean()), "median": float(df["price"].median()),
              "min": float(df["price"].min()), "max": float(df["price"].max()),
              "n": int(len(df)), "localities": int(df["loc_n"].nunique())},
    "model_comparison": holdout,
    "holdout": holdout,
}
open(f"{WEB}/public/data/stats.json", "w").write(j(stats))
print("artifacts exported.")
