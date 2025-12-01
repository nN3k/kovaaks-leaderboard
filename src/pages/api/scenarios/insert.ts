import type { APIRoute } from 'astro';
import { createClient } from '@libsql/client';
import { ensureTableExists } from './scenarioDb';

const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const POST: APIRoute = async ({ request }) => {
    try {
        const { steamId, score, vod, scenarioName } = await request.json();

        if (!steamId || score == null || !vod || !scenarioName) {
            return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
        }

        // sanitize table name
        const tableName = scenarioName.replace(/[^a-zA-Z0-9_]/g, '_');

        // ensure table exists
        await ensureTableExists(tableName);

        // insert or update only if the new score is higher
        await db.execute({
            sql: `
                INSERT INTO "${tableName}" (SteamId, Score, VOD)
                VALUES (?, ?, ?)
                ON CONFLICT(SteamId) DO UPDATE SET
                    Score = CASE
                        WHEN excluded.Score > "${tableName}".Score
                        THEN excluded.Score
                        ELSE "${tableName}".Score
                    END,
                    VOD = CASE
                        WHEN excluded.Score > "${tableName}".Score
                        THEN excluded.VOD
                        ELSE "${tableName}".VOD
                    END
            `,
            args: [steamId, score, vod],
        });

        // check row count
        const countResult = await db.execute({
            sql: `SELECT COUNT(*) as cnt FROM "${tableName}"`
        });

        // safely get row count as a number
        const rowCount = Number(countResult.rows?.[0]?.[0] ?? 0);

        // delete lowest scores if more than 50
        if (rowCount > 50) {
            await db.execute({
                sql: `
                    DELETE FROM "${tableName}"
                    WHERE id IN (
                        SELECT id FROM "${tableName}"
                        ORDER BY Score ASC, CreatedAt ASC
                        LIMIT ?
                    )
                `,
                args: [rowCount - 50],
            });
        }


        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
