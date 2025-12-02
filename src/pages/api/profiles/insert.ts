// src/pages/api/profiles/insert.json.ts
import type { APIRoute } from "astro";
import { createClient } from "@libsql/client";


// Turso client
const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function profileExists(steamId: string) {
  const result = await db.execute({
    sql: "SELECT 1 FROM profiles WHERE SteamId = ? LIMIT 1",
    args: [steamId],
  });

  return result.rows.length > 0;
}

async function updateProfile(steamId: string, data: Record<string, any>) {
    // 1. Fetch current profile
    const current = await db.execute({
        sql: "SELECT * FROM profiles WHERE SteamId = ? LIMIT 1",
        args: [steamId],
    });

    if (current.rows.length === 0) return; // no profile found

    const profile = current.rows[0];

    // 2. Determine which fields changed
    const changedEntries = Object.entries(data).filter(
        ([key, value]) => profile[key] !== value
    );

    if (changedEntries.length === 0) return; // nothing to update

    // 3. Build update query only for changed fields
    const setClause = changedEntries.map(([k]) => `${k} = ?`).join(", ");
    const values = changedEntries.map(([, v]) => v);

    // 4. Perform update
    await db.execute({
        sql: `UPDATE profiles SET ${setClause} WHERE SteamId = ?`,
        args: [...values, steamId],
    });
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();


        if (!data.steamId || !data.steamName) {
            return new Response(
                JSON.stringify({ error: "steamId and steamName are required" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        if (await profileExists(data.steamId)) {
            await updateProfile(data.steamId, {
                SteamName: data.steamName,
                Country: data.country,
                isBanned: data.isBanned,
            });


            return new Response(
                JSON.stringify({ error: "Profile with this steamId already exists and has been updated" }),
                {
                    status: 200,
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
