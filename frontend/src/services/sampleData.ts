import type { PersonModel, Garment, CategoryInfo } from '../types';

export const SAMPLE_MODELS: PersonModel[] = [
  {
    id: 'model_maya',
    name: 'Maya (Studio Editorial)',
    gender: 'female',
    image_url: '/data/samples/models/model_maya.jpg',
    description: 'High-contrast studio lighting, neutral editorial pose'
  },
  {
    id: 'model_leo',
    name: 'Leo (Minimalist Tailoring)',
    gender: 'male',
    image_url: '/data/samples/models/model_leo.jpg',
    description: 'Crisp studio portrait, structured shoulder alignment'
  },
  {
    id: 'model_zara',
    name: 'Zara (High Fashion Runway)',
    gender: 'female',
    image_url: '/data/samples/models/model_zara.jpg',
    description: 'Dramatic lighting, clean silhouette geometry'
  },
  {
    id: 'model_kai',
    name: 'Kai (Contemporary Street)',
    gender: 'male',
    image_url: '/data/samples/models/model_kai.jpg',
    description: 'Urban luxury aesthetic, relaxed torso frame'
  },
  {
    id: 'model_elena',
    name: 'Elena (Parisian Chic)',
    gender: 'female',
    image_url: '/data/samples/models/model_elena.jpg',
    description: 'Natural daylight, refined neckline and posture'
  },
  {
    id: 'model_dev',
    name: 'Dev (Modern Heritage)',
    gender: 'male',
    image_url: '/data/samples/models/model_dev.jpg',
    description: 'Structured posture, suitable for traditional and casual apparel'
  }
];

export const CATEGORIES: CategoryInfo[] = [
  { id: 'all', name: 'All Pieces', type: 'all', description: 'Browse complete wardrobe' },
  { id: 'shirt', name: 'Shirts', type: 'upper_body', description: 'Silk, linen, oxford & button-downs' },
  { id: 't-shirt', name: 'T-Shirts', type: 'upper_body', description: 'Heavyweight graphic & luxury tees' },
  { id: 'hoodie', name: 'Hoodies', type: 'upper_body', description: 'French terry pullovers & sweatshirts' },
  { id: 'jacket', name: 'Outerwear', type: 'outerwear', description: 'Tailored blazers, denim & shearling' },
  { id: 'dress', name: 'Dresses', type: 'full_body', description: 'Silk slips, cocktail & evening gowns' },
  { id: 'saree', name: 'Sarees', type: 'traditional', description: 'Pure Banarasi & Kanjivaram drapes' },
  { id: 'kurta', name: 'Kurtas', type: 'traditional', description: 'Chikankari linen tunics & bandhgalas' },
  { id: 'pants', name: 'Pants', type: 'lower_body', description: 'Pleated wool trousers & denim' },
  { id: 'skirt', name: 'Skirts', type: 'lower_body', description: 'Pleated crepe & silk midi skirts' },
  { id: 'other', name: 'Accessories', type: 'accessory', description: 'Scarves, shawls & couture accents' }
];

export const SAMPLE_GARMENTS: Garment[] = [
  {
    id: 'garm_silk_shirt',
    name: 'Champagne Silk Cuban Shirt',
    category: 'shirt',
    sub_category: 'upper_body',
    color: 'Champagne Gold',
    brand: 'AM Atelier',
    image_url: '/data/samples/garments/garm_silk_shirt.jpg',
    description: 'Lustrous pure mulberry silk shirt with structured collar and mother-of-pearl buttons.',
    is_sample: true
  },
  {
    id: 'garm_noir_hoodie',
    name: 'Obsidian Heavyweight Hoodie',
    category: 'hoodie',
    sub_category: 'upper_body',
    color: 'Noir Black',
    brand: 'VYBE Lab',
    image_url: '/data/samples/garments/garm_noir_hoodie.jpg',
    description: '500 GSM French terry cotton oversized drop-shoulder hoodie with ribbed trims.',
    is_sample: true
  },
  {
    id: 'garm_denim_jacket',
    name: 'Vintage Washed Selvedge Denim Jacket',
    category: 'jacket',
    sub_category: 'outerwear',
    color: 'Indigo Blue',
    brand: 'AM Atelier',
    image_url: '/data/samples/garments/garm_denim_jacket.jpg',
    description: 'Custom 14oz Japanese selvedge denim jacket with bronze hardware and washed patina.',
    is_sample: true
  },
  {
    id: 'garm_emerald_dress',
    name: 'Emerald Evening Silk Slip Dress',
    category: 'dress',
    sub_category: 'full_body',
    color: 'Emerald Green',
    brand: 'AM Couture',
    image_url: '/data/samples/garments/garm_emerald_dress.jpg',
    description: 'Fluid bias-cut silk satin gown with elegant cowl neckline and floor-length drape.',
    is_sample: true
  },
  {
    id: 'garm_royal_saree',
    name: 'Royal Crimson Banarasi Silk Saree',
    category: 'saree',
    sub_category: 'traditional',
    color: 'Crimson & Gold',
    brand: 'AM Heritage',
    image_url: '/data/samples/garments/garm_royal_saree.jpg',
    description: 'Handwoven pure katan silk saree embellished with intricate gold zari brocade work.',
    is_sample: true
  },
  {
    id: 'garm_linen_kurta',
    name: 'Ivory Chikankari Embroidered Kurta',
    category: 'kurta',
    sub_category: 'traditional',
    color: 'Ivory White',
    brand: 'AM Heritage',
    image_url: '/data/samples/garments/garm_linen_kurta.jpg',
    description: 'Handcrafted breathable linen kurta with traditional tone-on-tone Lucknowi embroidery.',
    is_sample: true
  },
  {
    id: 'garm_minimal_tee',
    name: 'Minimalist Sand Boxy Heavyweight Tee',
    category: 't-shirt',
    sub_category: 'upper_body',
    color: 'Sand Beige',
    brand: 'VYBE Lab',
    image_url: '/data/samples/garments/garm_minimal_tee.jpg',
    description: '280 GSM heavyweight combed cotton boxy fit tee with clean ribbed neckband.',
    is_sample: true
  },
  {
    id: 'garm_tailored_pants',
    name: 'Pleated Charcoal Wool Trousers',
    category: 'pants',
    sub_category: 'lower_body',
    color: 'Charcoal',
    brand: 'AM Atelier',
    image_url: '/data/samples/garments/garm_tailored_pants.jpg',
    description: 'Relaxed wide-leg trousers tailored in fine Italian wool with double front pleats.',
    is_sample: true
  },
  {
    id: 'garm_pleated_skirt',
    name: 'Midnight Pleated Crepe Midi Skirt',
    category: 'skirt',
    sub_category: 'lower_body',
    color: 'Midnight Navy',
    brand: 'AM Couture',
    image_url: '/data/samples/garments/garm_pleated_skirt.jpg',
    description: 'Accordion-pleated high-waisted fluid crepe midi skirt with flowing movement.',
    is_sample: true
  },
  {
    id: 'garm_leather_jacket',
    name: 'Obsidian Lambskin Leather Biker Jacket',
    category: 'jacket',
    sub_category: 'outerwear',
    color: 'Noir Black',
    brand: 'AM Atelier',
    image_url: '/data/samples/garments/garm_leather_jacket.jpg',
    description: 'Supple full-grain Italian lambskin leather jacket with silver asymmetric hardware.',
    is_sample: true
  }
];
