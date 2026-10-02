import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np, pandas as pd

ROOT = "/Users/pruthvi/Projects/real-estate-price-simulator"
OUT = f"{ROOT}/docs/figs"
import os
os.makedirs(OUT, exist_ok=True)

df = pd.read_csv(f"{ROOT}/data/hyderabad_clean.csv")
FEATS = ["area","bedrooms","resale","pool","gym","clubhouse","security","backup","car_parking","lift","vaastu"]
LAB = {"area":"Carpet area","bedrooms":"Bedrooms","resale":"Resale","pool":"Swimming pool","gym":"Gymnasium",
       "clubhouse":"Club house","security":"24x7 security","backup":"Power backup","car_parking":"Covered parking",
       "lift":"Lift","vaastu":"Vaastu"}
corr = df[FEATS + ["price"]].corr()["price"].drop("price").sort_values()
plt.rcParams.update({"font.size": 10, "axes.spines.top": False, "axes.spines.right": False})

# 1) correlation with price (horizontal bars, signed)
fig, ax = plt.subplots(figsize=(7.4, 4.2))
colors = ["#059669" if v >= 0 else "#e11d48" for v in corr]
ax.barh([LAB[k] for k in corr.index], corr.values, color=colors, height=0.62)
for i, v in enumerate(corr.values):
    ax.text(v + (0.012 if v >= 0 else -0.012), i, f"{v:+.3f}", va="center",
            ha="left" if v >= 0 else "right", fontsize=9)
ax.set_xlim(-0.15, 1.0); ax.set_xlabel("Pearson r with price")
ax.set_title("Correlation of each feature with price (n = 2,518 Hyderabad listings)", fontsize=11, fontweight="bold")
fig.tight_layout(); fig.savefig(f"{OUT}/corr_bars.png", dpi=150); plt.close(fig)

# 2) model R2 comparison
names = ["Area only", "+ BHK & amenities", "+ locality", "Neural net"]
r2s = [0.6930, 0.7087, 0.7748, 0.7140]
rmses = [43.99, 42.86, 37.68, 42.46]
fig, ax = plt.subplots(figsize=(7.4, 3.9))
cols = ["#94a3b8", "#22d3ee", "#10b981", "#a78bfa"]
bars = ax.bar(names, r2s, color=cols, width=0.55)
for b, r2, rmse in zip(bars, r2s, rmses):
    ax.text(b.get_x() + b.get_width()/2, b.get_height() + 0.012, f"R² = {r2:.3f}\nRMSE ₹{rmse:.2f} L",
            ha="center", fontsize=9)
ax.set_ylim(0, 1.0); ax.set_ylabel("Holdout R² (20% unseen listings)")
ax.set_title("Model comparison — holdout performance", fontsize=11, fontweight="bold")
ax.grid(axis="y", alpha=0.25)
fig.tight_layout(); fig.savefig(f"{OUT}/model_bars.png", dpi=150); plt.close(fig)

# 3) architecture / data-flow diagram
fig, ax = plt.subplots(figsize=(9.6, 5.4))
ax.set_xlim(0, 10); ax.set_ylim(0, 6.2); ax.axis("off")
def box(x, y, w, h, title, sub, fc="#0f172a", ec="#10b981", tc="#e2e8f0"):
    ax.add_patch(plt.Rectangle((x, y), w, h, facecolor=fc, edgecolor=ec, lw=1.4, zorder=2))
    ax.text(x + w/2, y + h - 0.42, title, ha="center", va="center", fontsize=9.5, fontweight="bold", color=tc, zorder=3)
    ax.text(x + w/2, y + 0.42, sub, ha="center", va="center", fontsize=7.6, color="#94a3b8", zorder=3)
def arrow(x1, y1, x2, y2):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1), arrowprops=dict(arrowstyle="-|>", color="#64748b", lw=1.6, zorder=1))

box(0.4, 4.6, 2.0, 1.2, "Data layer", "hyderabad_sales.csv\nhyd_v2.csv (coords)")
box(3.4, 4.6, 2.0, 1.2, "prep_hyderabad.py", "clean · features ·\n48 localities + coords")
box(6.4, 4.6, 2.2, 1.2, "train_export_hyderabad.py", "OLS + 48 dummies\nMLP (32→16) · holdout")
arrow(2.4, 5.2, 3.4, 5.2); arrow(5.4, 5.2, 6.4, 5.2)

box(6.4, 2.6, 2.2, 1.2, "JSON artifacts", "linear.json · mlp.json\ncity_map · houses · stats")
box(0.4, 2.6, 2.0, 1.2, "Next.js app", "9 pages · 4 API routes\nTS inference engine")
box(3.4, 2.6, 2.0, 1.2, "OpenCode Go LLM", "glm-5.3-flash\n₹ explanations")
arrow(6.4, 3.2, 2.4, 3.2)  # hard to route; use elbow: artifacts -> app
ax.annotate("", xy=(2.4, 3.2), xytext=(6.4, 3.2), arrowprops=dict(arrowstyle="-|>", color="#64748b", lw=1.6))
arrow(5.4, 4.6, 6.4, 3.8)  # next.js? actually app -> llm
ax.annotate("", xy=(5.4, 3.2), xytext=(3.4, 3.2), arrowprops=dict(arrowstyle="-|>", color="#64748b", lw=1.6))

box(0.4, 0.5, 2.0, 1.2, "Browser (client)", "React UI · Recharts\nLeaflet map · theme")
box(3.4, 0.5, 2.0, 1.2, "Vercel (prod)", "serverless functions\nreal-estate-price-simulator.vercel.app")
box(6.4, 0.5, 2.2, 1.2, "CI (GitHub Actions)", "pipeline + web build\non every push")
arrow(2.4, 1.1, 3.4, 1.1)
ax.set_title("Real Estate Price Simulator — system architecture", fontsize=12, fontweight="bold", pad=12)
fig.tight_layout(); fig.savefig(f"{OUT}/pipeline.png", dpi=150); plt.close(fig)
print("figures:", os.listdir(OUT))
