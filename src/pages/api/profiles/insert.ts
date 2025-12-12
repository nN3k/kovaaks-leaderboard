import type { APIRoute } from "astro";
import { db } from "../../../utils/turso-client";
import { verifyApiKey } from "../../../../utils/api/key/manage-keys";
import config from "../../../data/config.json";

const baseUrl = import.meta.env.PROD ? import.meta.env.PUBLIC_NETLIFY_URL : import.meta.env.PUBLIC_LOCAL_URL;

export async function profileExists(steamId: string) {
    const result = await db.execute({
        sql: "SELECT 1 FROM profiles WHERE SteamId = ? LIMIT 1",
        args: [steamId],
    });
    
    return result.rows.length > 0;
}

async function updateProfile(steamId: string, data: Record<string, any>) {
    const current = await db.execute({
        sql: "SELECT * FROM profiles WHERE SteamId = ? LIMIT 1",
        args: [steamId],
    });
    
    if (current.rows.length === 0) return; // no profile found
    
    const profile = current.rows[0];
    
    // Determine which fields changed
    const changedEntries = Object.entries(data).filter(
        ([key, value]) => profile[key] !== value
    );
    
    if (changedEntries.length === 0) return;
    

    const setClause = changedEntries.map(([k]) => `${k} = ?`).join(", ");
    const values = changedEntries.map(([, v]) => v);
    

    await db.execute({
        sql: `UPDATE profiles SET ${setClause} WHERE SteamId = ?`,
        args: [...values, steamId],
    });
}

export const POST: APIRoute = async ({ request }) => {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    const origin = new URL(request.url).origin;

    if (origin !== baseUrl) {
        console.error(`Invalid origin: ${origin}`);
        return new Response(JSON.stringify({ error: 'Invalid origin' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key required' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    const isValid = await verifyApiKey(apiKey);
    
    if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid API key' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    


    try {
        const data = await request.json();

        if (!data.steamId || !data.steamName || !data.scenarioId) {
            console.error(`Missing data in request: SteamID: ${data.steamId} ScenarioID: ${data.scenarioId} SteamName: ${data.steamName}`);
            return new Response(
                JSON.stringify({ error: "Missing data" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
        
        const response = await fetch(
            `https://kovaaks.com/webapp-backend/leaderboard/scores/global?leaderboardId=${data.scenarioId}&page=0&max=${config.rank_cutoff}`
        );
        const scenarioData = await response.json();

        const userEntry = scenarioData.data.find((entry: any) => entry.steamId === data.steamId);
        if (!userEntry) {
            console.error("User entry not found in scenario data");
            return new Response(JSON.stringify({ error: "User entry not found in scenario data" }), { status: 404 });
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
