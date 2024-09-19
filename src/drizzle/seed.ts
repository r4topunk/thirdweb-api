import '#env.ts';
import { db } from '#src/drizzle/index.ts';

async function seed() {
  console.log('Seeding...');
  console.time('DB has been seeded!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seeding done!');
    process.exit(0);
  });
