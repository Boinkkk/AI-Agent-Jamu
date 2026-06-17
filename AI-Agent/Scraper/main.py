import pandas as pd
import random

df = pd.read_csv("jamu.csv", sep=";", encoding="latin-1")

df_new = pd.DataFrame()

df_new["category_id"] = [1] * len(df)
df_new["name"] = df["NAMA JAMU"]
df_new["slug"] = [""] * len(df)

df_new["description"] = (
    "Khasiat: " + df["KHASIAT"].astype(str) + 
    " | Aturan Pakai: " + df["ATURAN PAKAI"].astype(str) + 
    " | Jenis: " + df["JENIS"].astype(str)
)

df_new["price"] = df["HARGA"]
df_new["stock_quantity"] = [100] * len(df)
df_new["weight_grams"] = [100] * len(df)
df_new["image_url"] = [""] * len(df)
df_new["is_active"] = [1] * len(df)
df_new["average_rating"] = [round(random.uniform(3.0, 5.0), 1) for _ in range(len(df))]
df_new["benefit"] = df["KHASIAT"]
df_new["composition"] = df["KANDUNGAN"]
df_new["directions"] = df["ATURAN PAKAI"]
df_new["storage_instructions"] = df["SARAN PENYIMPANAN"]
df_new["manufacturer"] = df["PRODUSEN"]
df_new["marketing_location"] = df["LOKASI PEMASARAN"]
df_new["production_location"] = df["LOKASI PRODUKSI"]
df_new["regency"] = df["KABUPATEN"]
df_new["licensing"] = df["PERIZINAN"]
df_new["licensing_number"] = df["NOMOR IZIN"]

df_new.to_csv("jamu_transformed.csv", index=False)