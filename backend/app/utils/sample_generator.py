import httpx
import os
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance, ImageFilter
import io

from ..config import SAMPLES_DIR
from ..database import SessionLocal
from ..models.garment import Garment


REAL_MODELS = [
    {
        "id": "model_maya",
        "name": "Maya (Studio Editorial)",
        "gender": "female",
        "desc": "High-contrast studio lighting, neutral editorial pose",
        "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "model_leo",
        "name": "Leo (Minimalist Tailoring)",
        "gender": "male",
        "desc": "Crisp studio portrait, structured shoulder alignment",
        "url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "model_zara",
        "name": "Zara (High Fashion Runway)",
        "gender": "female",
        "desc": "Dramatic lighting, clean silhouette geometry",
        "url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "model_kai",
        "name": "Kai (Contemporary Street)",
        "gender": "male",
        "desc": "Urban luxury aesthetic, relaxed torso frame",
        "url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "model_elena",
        "name": "Elena (Parisian Chic)",
        "gender": "female",
        "desc": "Natural daylight, refined neckline and posture",
        "url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "model_dev",
        "name": "Dev (Modern Heritage)",
        "gender": "male",
        "desc": "Structured posture, suitable for traditional and casual apparel",
        "url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=768&h=1024&q=85"
    }
]


REAL_GARMENTS = [
    {
        "id": "garm_silk_shirt",
        "name": "Champagne Silk Cuban Shirt",
        "category": "shirt",
        "sub_category": "upper_body",
        "color": "Champagne Gold",
        "brand": "AM Atelier",
        "desc": "Lustrous pure mulberry silk shirt with structured collar and mother-of-pearl buttons.",
        "url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "garm_noir_hoodie",
        "name": "Obsidian Heavyweight Hoodie",
        "category": "hoodie",
        "sub_category": "upper_body",
        "color": "Noir Black",
        "brand": "VYBE Lab",
        "desc": "500 GSM French terry cotton oversized drop-shoulder hoodie with ribbed trims.",
        "url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "garm_denim_jacket",
        "name": "Vintage Washed Selvedge Denim Jacket",
        "category": "jacket",
        "sub_category": "outerwear",
        "color": "Indigo Blue",
        "brand": "AM Atelier",
        "desc": "Custom 14oz Japanese selvedge denim jacket with bronze hardware and washed patina.",
        "url": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "garm_emerald_dress",
        "name": "Emerald Evening Silk Slip Dress",
        "category": "dress",
        "sub_category": "full_body",
        "color": "Emerald Green",
        "brand": "AM Couture",
        "desc": "Fluid bias-cut silk satin gown with elegant cowl neckline and floor-length drape.",
        "url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "garm_royal_saree",
        "name": "Royal Crimson Banarasi Silk Saree",
        "category": "saree",
        "sub_category": "traditional",
        "color": "Crimson & Gold",
        "brand": "AM Heritage",
        "desc": "Handwoven pure katan silk saree embellished with intricate gold zari brocade work.",
        "url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "garm_linen_kurta",
        "name": "Ivory Chikankari Embroidered Kurta",
        "category": "kurta",
        "sub_category": "traditional",
        "color": "Ivory White",
        "brand": "AM Heritage",
        "desc": "Handcrafted breathable linen kurta with traditional tone-on-tone Lucknowi embroidery.",
        "url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "garm_minimal_tee",
        "name": "Minimalist Sand Boxy Heavyweight Tee",
        "category": "t-shirt",
        "sub_category": "upper_body",
        "color": "Sand Beige",
        "brand": "VYBE Lab",
        "desc": "280 GSM heavyweight combed cotton boxy fit tee with clean ribbed neckband.",
        "url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "garm_tailored_pants",
        "name": "Pleated Charcoal Wool Trousers",
        "category": "pants",
        "sub_category": "lower_body",
        "color": "Charcoal",
        "brand": "AM Atelier",
        "desc": "Relaxed wide-leg trousers tailored in fine Italian wool with double front pleats.",
        "url": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "garm_pleated_skirt",
        "name": "Midnight Pleated Crepe Midi Skirt",
        "category": "skirt",
        "sub_category": "lower_body",
        "color": "Midnight Navy",
        "brand": "AM Couture",
        "desc": "Accordion-pleated high-waisted fluid crepe midi skirt with flowing movement.",
        "url": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=768&h=1024&q=85"
    },
    {
        "id": "garm_leather_jacket",
        "name": "Obsidian Lambskin Leather Biker Jacket",
        "category": "jacket",
        "sub_category": "outerwear",
        "color": "Noir Black",
        "brand": "AM Atelier",
        "desc": "Supple full-grain Italian lambskin leather jacket with silver asymmetric hardware.",
        "url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=768&h=1024&q=85"
    }
]


def generate_sample_assets():
    models_dir = SAMPLES_DIR / "models"
    garments_dir = SAMPLES_DIR / "garments"
    models_dir.mkdir(parents=True, exist_ok=True)
    garments_dir.mkdir(parents=True, exist_ok=True)

    print("Fetching authentic studio fashion photography for models...")
    for m in REAL_MODELS:
        target_path = models_dir / f"{m['id']}.jpg"
        if not target_path.exists() or target_path.stat().st_size < 10000:
            try:
                res = httpx.get(m["url"], timeout=20.0, follow_redirects=True)
                if res.status_code == 200:
                    img = Image.open(io.BytesIO(res.content)).convert("RGB")
                    img = ImageOps.fit(img, (768, 1024), Image.Resampling.LANCZOS)
                    img.save(target_path, "JPEG", quality=90)
                    print(f" [OK] Saved real model: {m['name']}")
            except Exception as e:
                print(f" [FAIL] Error fetching model {m['id']}: {e}")
        else:
            print(f" [EXISTS] Model {m['id']} ready.")

    print("\nFetching authentic studio clothing photography for garments...")
    for g in REAL_GARMENTS:
        target_path = garments_dir / f"{g['id']}.jpg"
        if not target_path.exists() or target_path.stat().st_size < 10000:
            try:
                res = httpx.get(g["url"], timeout=20.0, follow_redirects=True)
                if res.status_code == 200:
                    img = Image.open(io.BytesIO(res.content)).convert("RGB")
                    img = ImageOps.fit(img, (768, 1024), Image.Resampling.LANCZOS)
                    img.save(target_path, "JPEG", quality=90)
                    print(f" [OK] Saved real garment: {g['name']}")
            except Exception as e:
                print(f" [FAIL] Error fetching garment {g['id']}: {e}")
        else:
            print(f" [EXISTS] Garment {g['id']} ready.")

    # Seed or update Database
    db = SessionLocal()
    try:
        for g in REAL_GARMENTS:
            existing = db.query(Garment).filter(Garment.id == g["id"]).first()
            img_url = f"/data/samples/garments/{g['id']}.jpg"
            if existing:
                existing.name = g["name"]
                existing.category = g["category"]
                existing.sub_category = g.get("sub_category")
                existing.color = g.get("color")
                existing.brand = g.get("brand")
                existing.description = g.get("desc")
                existing.image_url = img_url
                existing.thumbnail_url = img_url
            else:
                garment = Garment(
                    id=g["id"],
                    name=g["name"],
                    category=g["category"],
                    sub_category=g.get("sub_category"),
                    color=g.get("color"),
                    brand=g.get("brand"),
                    image_url=img_url,
                    thumbnail_url=img_url,
                    description=g.get("desc"),
                    is_sample=True
                )
                db.add(garment)
        db.commit()
        print("\nDatabase synchronized with real fashion garments.")
    finally:
        db.close()


if __name__ == "__main__":
    generate_sample_assets()
