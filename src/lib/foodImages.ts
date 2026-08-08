/**
 * Centralized food photo mapping — every URL here was individually verified to resolve to a
 * real, relevant photo (Wikimedia Commons / Pexels) before being wired in. Swap or add entries
 * here to change a dish's photo without touching any component.
 */
export const FOOD_IMAGES: Record<string, string> = {
  'chicken-biryani':
    'https://upload.wikimedia.org/wikipedia/commons/5/5a/Chicken_biriyani_%40_Star_Ambur_Biriyani_%287519153014%29.jpg',
  'mandi-biryani': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Mandi_Biryani.jpg',
  'bucket-biryani': 'https://upload.wikimedia.org/wikipedia/commons/9/98/The_Red_Bucket_Biryani.jpg',
  'chicken-fried-rice':
    'https://upload.wikimedia.org/wikipedia/commons/5/5b/Chicken_fried_rice_-_Stir_Fry_by_CK_2023-12-02.jpg',
  'chicken-noodles': 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Chicken_noodles_01.jpg',
  'butter-chicken': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Butter_Chicken_%282446546141%29.jpg',
  'chicken-65': 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Chicken_65_%28Dish%29.jpg',
  'pepper-chicken': 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Dakshin_-_kozhi_varuval_%28332922772%29.jpg',
  'grill-chicken': 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Chicken_Drumsticks_on_a_Grill.jpg',
  'bbq-chicken': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/BBQ_Chicken_at_Craigs_BBQ.jpg',
  'fried-chicken': 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Fried_Crispy_chicken.jpg',
  'french-fries':
    'https://upload.wikimedia.org/wikipedia/commons/c/c8/McDonald%27s_French_Fries%2C_Canada%2C_2026-04-04.jpg',
  'chicken-burger': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chicken-burger-combo_%281%29.jpg',
  parotta: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Parotta_from_Kerala.jpg',
  mojito: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Mojito_Cocktail.jpg',
  shawarma: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Chicken_Shawarma_Wrap_-_Lavash_2024-09-11.jpg',
  'family-combo': 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Veg_Full_Meals_in_Tamil_Nadu.JPG',
  'party-combo':
    'https://images.pexels.com/photos/12253094/pexels-photo-12253094.jpeg?cs=srgb&dl=pexels-stewphotography-12253094.jpg&fm=jpg',
  'festival-combo':
    'https://upload.wikimedia.org/wikipedia/commons/f/fc/A_thali_served_on_banana_leaf_during_a_wedding%2C_south_India.jpg',
}

/** Wide landscape shot — used for the homepage hero and section banners. */
export const HERO_BANNER_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/9/98/Dindigul_Thalappakatti_Biryani_1.jpg'

export function getFoodImageUrl(itemId: string): string | undefined {
  return FOOD_IMAGES[itemId]
}
