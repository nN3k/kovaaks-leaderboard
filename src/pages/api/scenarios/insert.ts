import type { APIRoute } from 'astro';
import { db, ensureTableExists, quoteSqlIdentifier } from './scenarioDb';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { steamId, score, vod, scenarioName } = await request.json();

        if (!steamId || score == null || !vod || !scenarioName) {
            return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
        }

        // Ensure the scenario table exists and get the normalized table name
        const normalizedTableName = await ensureTableExists(scenarioName);

        // Safely quote the table name for SQL
        const table = quoteSqlIdentifier(normalizedTableName);

        // Insert or update score if the new score is higher
        await db.execute({
            sql: `
                INSERT INTO ${table} (SteamId, Score, VOD)
                VALUES (?, ?, ?)
                ON CONFLICT(SteamId) DO UPDATE SET
                    Score = CASE
                        WHEN excluded.Score > Score THEN excluded.Score ELSE Score END,
                    VOD = CASE
                        WHEN excluded.Score > Score THEN excluded.VOD ELSE VOD END
            `,
            args: [steamId, score, vod],
        });

        // Count rows to enforce top 50 scores
        const countResult = await db.execute({
            sql: `SELECT COUNT(*) as cnt FROM ${table}`
        });
        const rowCount = Number(countResult.rows?.[0]?.[0] ?? 0);

        if (rowCount > 50) {
            await db.execute({
                sql: `
                    DELETE FROM ${table}
                    WHERE id IN (
                        SELECT id FROM ${table}
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
