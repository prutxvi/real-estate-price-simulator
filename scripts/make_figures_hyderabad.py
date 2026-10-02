"""Regenerate report figures for the Hyderabad dataset (same filenames as before)."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np, pandas as pd
from sklearn.model_selection import train_test_split
import statsmodels.api as sm

ROOT = "/Users/pruthvi/Projects/real-estate-price-simulator"
OUT = f"{ROOT}/web/public/figures"
import os
os.makedirs(OUT, exist_ok=True)

df = pd.read_csv(f"{ROOT}/data/hyderabad_clean.csv")
FEATS = ["area","bedrooms","resale","pool","gym","clubhouse","security","backup","car_parking","lift","vaastu"]
train, test = train_test_split(df, test_size=0.2, random_state=42)
yt = train["price"].values / 1e6
Xm = sm.add_constant(train[FEATS].astype(float))
mm = sm.OLS(yt, Xm).fit()
Xv = sm.add_constant(test[FEATS].astype(float))
yv = test["price"].values / 1e6
pv = mm.predict(Xv)
resid = (yv - pv) * 1e6
fitted = pv * 1e6

plt.rcParams.update({"figure.facecolor": "white", "axes.facecolor": "white", "font.size": 10})

# 1) correlation heatmap (numeric features + price)
c = df[FEATS + ["price"]].corr()
fig, ax = plt.subplots(figsize=(8, 6.5))
im = ax.imshow(c.values, cmap="RdYlGn", vmin=-1, vmax=1)
ticks = np.arange(len(c.columns))
ax.set_xticks(ticks); ax.set_yticks(ticks)
labels = ["area","BHK","resale","pool","gym","club","sec","backup","park","lift","vaastu","price"]
ax.set_xticklabels(labels, rotation=45, ha="right"); ax.set_yticklabels(labels)
for i in range(len(c)):
    for j in range(len(c)):
        ax.text(j, i, f"{c.values[i,j]:.2f}", ha="center", va="center", fontsize=7,
                color="black" if abs(c.values[i,j]) < 0.5 else "white")
fig.colorbar(im, fraction=0.046, pad=0.04)
fig.tight_layout(); fig.savefig(f"{OUT}/corr_heatmap.png", dpi=150); plt.close(fig)

# 2) residual diagnostics (resid vs fitted + QQ)
fig, ax = plt.subplots(figsize=(7, 5))
ax.scatter(fitted, resid, s=6, alpha=0.4, color="#0ea5b7")
ax.axhline(0, color="#333", lw=1)
ax.set_xlabel("Fitted price (₹)"); ax.set_ylabel("Residual (₹)")
ax.xaxis.set_major_formatter(lambda v, _: f"₹{v/1e7:.1f}Cr")
ax.yaxis.set_major_formatter(lambda v, _: f"₹{v/1e7:.1f}Cr")
fig.tight_layout(); fig.savefig(f"{OUT}/residuals.png", dpi=150); plt.close(fig)

# 3) scatter top: area vs price
fig, ax = plt.subplots(figsize=(7.5, 5))
ax.scatter(df["area"], df["price"], s=8, alpha=0.45, color="#10b981")
ax.set_xlabel("Carpet area (sq ft)"); ax.set_ylabel("Price (₹)")
ax.yaxis.set_major_formatter(lambda v, _: f"₹{v/1e7:.1f}Cr")
fig.tight_layout(); fig.savefig(f"{OUT}/scatter_top3.png", dpi=150); plt.close(fig)
print("figures regenerated:", os.listdir(OUT))
