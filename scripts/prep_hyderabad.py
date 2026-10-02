"""Prep Hyderabad sales data -> hyderabad_clean.csv with coordinates + grouped localities."""
import re
import numpy as np, pandas as pd

ROOT = "/Users/pruthvi/Projects/real-estate-price-simulator"
sales = pd.read_csv(f"{ROOT}/data/hyderabad_sales.csv")
rent  = pd.read_csv(f"{ROOT}/data/hyd_v2.csv", usecols=["locality", "location"])

def norm(s):
    if pd.isna(s): return ""
    return re.sub(r"[^a-z0-9]+", "", str(s).casefold())

def keyname(a):
    return "amen_" + re.sub(r"[^a-z0-9]", "", a.lower())

df = sales.rename(columns={
    "Price": "price", "Area": "area", "Location": "location_raw", "No. of Bedrooms": "bedrooms", "Resale": "resale",
})
AMEN = ["MaintenanceStaff","Gymnasium","SwimmingPool","LandscapedGardens","JoggingTrack","RainWaterHarvesting",
        "IndoorGames","ShoppingMall","Intercom","SportsFacility","ATM","ClubHouse","School","24X7Security",
        "PowerBackup","CarParking","StaffQuarter","Cafeteria","MultipurposeRoom","Hospital","WashingMachine",
        "Gasconnection","AC","Wifi","Children'splayarea","LiftAvailable","BED","VaastuCompliant","Microwave",
        "GolfCourse","TV","DiningTable","Sofa","Wardrobe","Refrigerator"]
for a in AMEN:
    df[keyname(a)] = (df[a] >= 1).astype(int)

df["loc_n"] = df["location_raw"].map(norm)

coords = rent.dropna(subset=["location"]).copy()
parts = coords["location"].str.split(",", expand=True)
coords["lat"] = pd.to_numeric(parts[0], errors="coerce")
coords["long"] = pd.to_numeric(parts[1], errors="coerce")
coords = coords.dropna(subset=["lat", "long"])
coords["loc_n"] = coords["locality"].map(norm)
cent = coords.groupby("loc_n").agg(lat=("lat", "mean"), long=("long", "mean"), n=("lat", "size"))

HYD_CENTER = (17.3850, 78.4867)

def resolve_loc(n):
    if n in cent.index:
        return cent.loc[n, "lat"], cent.loc[n, "long"]
    if n:
        best, bn = None, 0
        for c in cent.index:
            if c and (c in n or n in c):
                nn = cent.loc[c, "n"]
                if nn > bn:
                    bn = nn; best = c
        if best:
            return cent.loc[best, "lat"], cent.loc[best, "long"]
    return HYD_CENTER

res = df.apply(lambda r: resolve_loc(r["loc_n"]), axis=1)
df["lat"] = [x[0] for x in res]
df["long"] = [x[1] for x in res]
print("coords resolved (city center fallback count):", int((df["lat"] == HYD_CENTER[0]).sum()))

counts = df["loc_n"].value_counts()
top = counts.head(48).index
df["loc_n"] = df["loc_n"].where(df["loc_n"].isin(top), "Other")

DISPLAY = {
    "banjarahills": "Banjara Hills", "jubileehills": "Jubilee Hills", "hitechcity": "Hitech City",
    "pragathinagarkukatpally": "Pragathi Nagar", "bachupallyroad": "Bachupally Road",
    "appajunction": "Appa Junction", "appajunctionpeerancheru": "Appa Junction (Peerancheru)",
    "nallagandlagachibowli": "Nallagandla", "westmarredpally": "West Marredpally",
    "krrishnareddypet": "Krishna Reddy Pet", "gajulramaramkukatpally": "Gajularamaram",
}
def pretty(n):
    if n == "Other": return "Other localities"
    if n in DISPLAY: return DISPLAY[n]
    words = re.findall(r"[a-z]+", n)
    return " ".join(w.capitalize() for w in words)
df["location"] = df["loc_n"].map(pretty)

FEATS = {
    "area": "area", "bedrooms": "bedrooms", "resale": "resale",
    "pool": keyname("SwimmingPool"), "gym": keyname("Gymnasium"), "clubhouse": keyname("ClubHouse"),
    "security": keyname("24X7Security"), "backup": keyname("PowerBackup"), "car_parking": keyname("CarParking"),
    "lift": keyname("LiftAvailable"), "vaastu": keyname("VaastuCompliant"),
}
out = pd.DataFrame({
    "id": np.arange(len(df)),
    "price": df["price"].astype(float),
    "location": df["location"],
    "loc_n": df["loc_n"],
    "lat": df["lat"], "long": df["long"],
    **{k: df[v].astype(float) for k, v in FEATS.items()},
})
out = out[(out["area"] >= 300) & (out["area"] <= 15000) & (out["price"] >= 5e5) & (out["price"] <= 5e8)]
out.to_csv(f"{ROOT}/data/hyderabad_clean.csv", index=False)
print("saved hyderabad_clean.csv:", out.shape)
print("\nlocality counts (top 15):")
print(out["loc_n"].value_counts().head(15).to_string())
print("\nprice: mean %.0f median %.0f min %.0f max %.0f" % (out["price"].mean(), out["price"].median(), out["price"].min(), out["price"].max()))
print("area: mean %.0f median %.0f" % (out["area"].mean(), out["area"].median()))
print("\nfeature means:", {k: round(v, 3) for k, v in out[list(FEATS.keys())].mean().items()})
