import { db, profile } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	await db.insert(profile).values({
		steamId: "0",
		steamName: 'Seeded User',
		country: 'GER',
		isBanned: false,
	})

	console.log("Database seeding from .ts file");
}
