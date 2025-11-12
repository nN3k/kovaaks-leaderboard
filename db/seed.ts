import { db, Profile } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	await db.insert(Profile).values({
		steamId: 0,
		steamName: 'Seeded User',
		country: 'GER',
		isBanned: false,
	})

	console.log("Database seeding from .ts file");
}
