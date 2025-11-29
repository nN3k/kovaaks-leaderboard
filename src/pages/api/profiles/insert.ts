// src/pages/api/profiles/insert.json.ts
import type { APIRoute } from "astro";
import { createClient } from "@libsql/client";

export const prerender = false;

// Turso client
const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.steamId || !data.steamName) {
            return new Response(
                JSON.stringify({ error: "steamId and steamName are required" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Build insert columns dynamically
        const columns = ["steamId", "steamName"];
        const placeholders = ["?", "?"];
        const args: string[] = [data.steamId, data.steamName];

        // Optional fields (will use DB defaults if missing)
        if (data.country) {
            columns.push("country");
            placeholders.push("?");
            args.push(data.country);
        }
        if (data.isBanned !== undefined) {
            columns.push("isBanned");
            placeholders.push("?");
            args.push(data.isBanned);
        }

        // Execute insert
        const sql = `INSERT INTO profiles (${columns.join(
            ", "
        )}) VALUES (${placeholders.join(", ")})`;

        const result = await db.execute({ sql, args });

        return new Response(
            JSON.stringify({ success: true, result }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Insert error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to insert profile" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
