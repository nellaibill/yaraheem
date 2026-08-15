import type { CategoryDto, ProductListResponse } from '@/lib/api/types'

// Mirrors backend/src/Ecommerce.Modules.Catalog/Infrastructure/CatalogSeeder.cs — same names,
// prices, descriptions, categories, and image URLs as the real menu, so the demo looks authentic.

interface CategorySeed {
  id: string
  name: string
  displayOrder: number
}

const CATEGORY_SEEDS: CategorySeed[] = [
  { id: 'biryani', name: 'Biryani', displayOrder: 1 },
  { id: 'rice-noodles', name: 'Rice & Noodles', displayOrder: 2 },
  { id: 'chicken-specials', name: 'Chicken Specials', displayOrder: 3 },
  { id: 'burgers-wraps', name: 'Burgers & Wraps', displayOrder: 4 },
  { id: 'sides-breads', name: 'Sides & Breads', displayOrder: 5 },
  { id: 'beverages', name: 'Beverages', displayOrder: 6 },
  { id: 'combos', name: 'Combos & Packs', displayOrder: 7 },
  { id: 'desserts', name: 'Desserts', displayOrder: 8 },
]

interface ProductSeed {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  isFeatured: boolean
  imageUrl: string | null
}

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    id: 'chicken-biryani',
    name: 'Nellai Chicken Biryani',
    description:
      'Seeraga samba rice dum-cooked with bone-in chicken, our house masala, and fried onions — the everyday favorite.',
    price: 220,
    categoryId: 'biryani',
    isFeatured: true,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/5a/Chicken_biriyani_%40_Star_Ambur_Biriyani_%287519153014%29.jpg',
  },
  {
    id: 'mandi-biryani',
    name: 'Chicken Mandi',
    description:
      'Slow-roasted chicken over fragrant mandi rice, finished with our smoky Friday-special spice blend.',
    price: 280,
    categoryId: 'biryani',
    isFeatured: true,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Mandi_Biryani.jpg',
  },
  {
    id: 'bucket-biryani',
    name: 'Family Bucket Biryani',
    description:
      'A full bucket of seeraga samba chicken biryani, generously portioned to feed 4 — weekend favorite.',
    price: 650,
    categoryId: 'biryani',
    isFeatured: true,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/The_Red_Bucket_Biryani.jpg',
  },
  {
    id: 'chicken-fried-rice',
    name: 'Chicken Fried Rice',
    description:
      'Wok-tossed rice with shredded chicken, spring onion, and soy — a lunch-counter classic.',
    price: 180,
    categoryId: 'rice-noodles',
    isFeatured: false,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/5b/Chicken_fried_rice_-_Stir_Fry_by_CK_2023-12-02.jpg',
  },
  {
    id: 'veg-fried-rice',
    name: 'Veg Fried Rice',
    description: 'Fresh vegetables and rice tossed on a high flame with soy and garlic.',
    price: 150,
    categoryId: 'rice-noodles',
    isFeatured: false,
    imageUrl: null,
  },
  {
    id: 'chicken-noodles',
    name: 'Chicken Noodles',
    description:
      'Hakka-style noodles stir-fried with chicken strips, capsicum, and a touch of chilli-garlic sauce.',
    price: 180,
    categoryId: 'rice-noodles',
    isFeatured: false,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Chicken_noodles_01.jpg',
  },
  {
    id: 'butter-chicken',
    name: 'Butter Chicken',
    description:
      'Char-grilled chicken simmered in a rich tomato-butter gravy — always a Sunday table favorite.',
    price: 260,
    categoryId: 'chicken-specials',
    isFeatured: false,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/4/44/Butter_Chicken_%282446546141%29.jpg',
  },
  {
    id: 'chicken-65',
    name: 'Chicken 65',
    description:
      'Deep-fried, curry-leaf-tossed chicken bites in our fiery house masala — the item everyone reorders.',
    price: 200,
    categoryId: 'chicken-specials',
    isFeatured: true,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Chicken_65_%28Dish%29.jpg',
  },
  {
    id: 'pepper-chicken',
    name: 'Pepper Chicken',
    description:
      'Dry-roasted chicken tossed in cracked black pepper and curry leaves — bold and smoky.',
    price: 220,
    categoryId: 'chicken-specials',
    isFeatured: false,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/1c/Dakshin_-_kozhi_varuval_%28332922772%29.jpg',
  },
  {
    id: 'grill-chicken',
    name: 'Grill Chicken',
    description:
      'A quarter chicken marinated overnight and grilled fresh to order, char-kissed and juicy.',
    price: 240,
    categoryId: 'chicken-specials',
    isFeatured: false,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/c/c3/Chicken_Drumsticks_on_a_Grill.jpg',
  },
  {
    id: 'bbq-chicken',
    name: 'BBQ Chicken',
    description: 'Smoky barbecue-glazed chicken pieces, char-grilled and basted till sticky-sweet.',
    price: 260,
    categoryId: 'chicken-specials',
    isFeatured: false,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/BBQ_Chicken_at_Craigs_BBQ.jpg',
  },
  {
    id: 'fried-chicken',
    name: 'Fried Chicken (4 pcs)',
    description: 'Crispy golden fried chicken, our late-night bestseller for a reason.',
    price: 200,
    categoryId: 'chicken-specials',
    isFeatured: true,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Fried_Crispy_chicken.jpg',
  },
  {
    id: 'french-fries',
    name: 'French Fries',
    description:
      'Golden, crispy-edged fries tossed with house seasoning — the go-to side for any order.',
    price: 100,
    categoryId: 'sides-breads',
    isFeatured: false,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/c/c8/McDonald%27s_French_Fries%2C_Canada%2C_2026-04-04.jpg',
  },
  {
    id: 'chicken-burger',
    name: 'Chicken Burger',
    description:
      'A crispy fried chicken patty stacked with lettuce, house mayo, and pickles in a soft bun.',
    price: 150,
    categoryId: 'burgers-wraps',
    isFeatured: false,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chicken-burger-combo_%281%29.jpg',
  },
  {
    id: 'parotta',
    name: 'Parotta (2 pcs)',
    description:
      'Flaky, hand-layered parotta, hot off the tawa — the ultimate pairing for any gravy.',
    price: 40,
    categoryId: 'sides-breads',
    isFeatured: true,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Parotta_from_Kerala.jpg',
  },
  {
    id: 'shawarma',
    name: 'Chicken Shawarma Roll',
    description:
      'Spiced, spit-style chicken shreds rolled in flatbread with garlic sauce and pickled veggies.',
    price: 120,
    categoryId: 'burgers-wraps',
    isFeatured: false,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/8/8e/Chicken_Shawarma_Wrap_-_Lavash_2024-09-11.jpg',
  },
  {
    id: 'mojito',
    name: 'Virgin Mojito',
    description: 'Fresh mint and lime muddled with soda over ice — a cooling counter to the spice.',
    price: 90,
    categoryId: 'beverages',
    isFeatured: false,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Mojito_Cocktail.jpg',
  },
  {
    id: 'jigarthanda',
    name: 'Jigarthanda',
    description:
      'The Madurai classic — almond gum, sarsaparilla syrup, milk, and ice cream layered cold.',
    price: 80,
    categoryId: 'beverages',
    isFeatured: true,
    imageUrl: null,
  },
  {
    id: 'paruthi-paal',
    name: 'Paruthi Paal',
    description: 'Traditional Tirunelveli cotton-seed milk, lightly sweetened and served chilled.',
    price: 70,
    categoryId: 'beverages',
    isFeatured: false,
    imageUrl: null,
  },
  {
    id: 'family-combo',
    name: 'Family Combo',
    description:
      'A complete meal for 4 — bucket biryani, Chicken 65, fries, and drinks, ready to share.',
    price: 899,
    categoryId: 'combos',
    isFeatured: true,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/5d/Veg_Full_Meals_in_Tamil_Nadu.JPG',
  },
  {
    id: 'party-combo',
    name: 'Party Combo',
    description:
      'Built for a get-together of 10 — biryani, grilled chicken, sides, and drinks, all in one order.',
    price: 1999,
    categoryId: 'combos',
    isFeatured: false,
    imageUrl:
      'https://images.pexels.com/photos/12253094/pexels-photo-12253094.jpeg?cs=srgb&dl=pexels-stewphotography-12253094.jpg&fm=jpg',
  },
  {
    id: 'festival-combo',
    name: 'Festival Combo',
    description:
      'A full banana-leaf feast for 15–20 guests — our most-booked catering combo for celebrations.',
    price: 2999,
    categoryId: 'combos',
    isFeatured: true,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/f/fc/A_thali_served_on_banana_leaf_during_a_wedding%2C_south_India.jpg',
  },
  {
    id: 'tirunelveli-halwa',
    name: 'Tirunelveli Halwa',
    description:
      "The town's signature wheat halwa — glossy, ghee-rich, and served the traditional way.",
    price: 60,
    categoryId: 'desserts',
    isFeatured: true,
    imageUrl: null,
  },
]

const categoryNameById = new Map(CATEGORY_SEEDS.map((c) => [c.id, c.name]))

export const demoCategories: CategoryDto[] = CATEGORY_SEEDS.map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.id,
  description: null,
  imageUrl: null,
  parentCategoryId: null,
  displayOrder: c.displayOrder,
  isActive: true,
}))

export const demoProducts: ProductListResponse[] = PRODUCT_SEEDS.map((p) => ({
  id: p.id,
  name: p.name,
  slug: p.id,
  sku: `YR-${p.id.toUpperCase()}`,
  price: p.price,
  comparePrice: null,
  thumbnailUrl: p.imageUrl,
  isFeatured: p.isFeatured,
  isPublished: true,
  stockQuantity: 50,
  categoryId: p.categoryId,
  categoryName: categoryNameById.get(p.categoryId) ?? '',
}))

export function findDemoProduct(id: string): ProductListResponse | undefined {
  return demoProducts.find((p) => p.id === id)
}
