import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log("Seeding petstore categories...");
  const categories = [
    { name: 'Pet Food', slug: 'pet-food', description: 'Dry food, wet food, treats for pets' },
    { name: 'Medicine', slug: 'medicine', description: 'Healthcare and medicinal products' },
    { name: 'Accessories', slug: 'accessories', description: 'Toys, collars, leashes, beds' },
    { name: 'Grooming', slug: 'grooming', description: 'Shampoos, brushes, nail clippers' }
  ];

  for (const cat of categories) {
    const res = await sql`INSERT INTO categories (name, slug, description) VALUES (${cat.name}, ${cat.slug}, ${cat.description}) ON CONFLICT (slug) DO NOTHING RETURNING id`;
    
    let catId;
    if (res.length > 0) {
      catId = res[0].id;
    } else {
      const existing = await sql`SELECT id FROM categories WHERE slug = ${cat.slug}`;
      catId = existing[0].id;
    }

    const subCats = [];
    if (cat.slug === 'pet-food') {
      subCats.push({ name: 'Dry Food', slug: 'dry-food' });
      subCats.push({ name: 'Wet Food', slug: 'wet-food' });
      subCats.push({ name: 'Treats', slug: 'treats' });
    } else if (cat.slug === 'medicine') {
      subCats.push({ name: 'Flea & Tick', slug: 'flea-tick' });
      subCats.push({ name: 'Supplements', slug: 'supplements' });
      subCats.push({ name: 'First Aid', slug: 'first-aid' });
    } else if (cat.slug === 'accessories') {
      subCats.push({ name: 'Toys', slug: 'toys' });
      subCats.push({ name: 'Collars & Leashes', slug: 'collars-leashes' });
      subCats.push({ name: 'Beds & Mats', slug: 'beds-mats' });
    } else if (cat.slug === 'grooming') {
      subCats.push({ name: 'Shampoos', slug: 'shampoos' });
      subCats.push({ name: 'Brushes', slug: 'brushes' });
    }

    for (const sub of subCats) {
      await sql`INSERT INTO sub_categories (name, slug, category_id) VALUES (${sub.name}, ${sub.slug}, ${catId}) ON CONFLICT (slug) DO NOTHING`;
    }
  }
  console.log("Done seeding categories and subcategories.");
}

seed().catch(console.error);
