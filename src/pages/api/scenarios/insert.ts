import type { APIRoute } from 'astro';
import { ensureTableExists, quoteSqlIdentifier } from './scenarioDb';
import { db } from "../../../utils/turso-client";
import { verifyApiKey } from '../../../../utils/api/key/manage-keys';

export const POST: APIRoute = async ({ request }) => {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    
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
        const { steamId, score, vod, accuracy, sens360, fov, fovScaling, avgFPS, scenarioName } = await request.json();

        if (!steamId || score == null || !vod || !scenarioName) {
            return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
        }


        const normalizedTableName = await ensureTableExists(scenarioName);


        const table = quoteSqlIdentifier(normalizedTableName);

        // Insert or update score if the new score is higher
        await db.execute({
            sql: `
                INSERT INTO ${table} (SteamId, Score, Vod, Accuracy, Sens360, Fov, FovScaling, AvgFps)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(SteamId) DO UPDATE SET
                    Score = CASE
                        WHEN excluded.Score > Score THEN excluded.Score ELSE Score END,
                    Vod = CASE
                        WHEN excluded.Score > Score THEN excluded.Vod ELSE Vod END
                    Accuracy = CASE
                        WHEN excluded.Score > Score THEN excluded.Accuracy ELSE Accuracy END
                    Sens360 = CASE
                        WHEN excluded.Score > Score THEN excluded.Sens360 ELSE Sens360 END
                    Fov = CASE
                        WHEN excluded.Score > Score THEN excluded.Fov ELSE Fov END
                    FovScaling = CASE
                        WHEN excluded.Score > Score THEN excluded.FovScaling ELSE FovScaling END
                    AvgFps = CASE
                        WHEN excluded.Score > Score THEN excluded.AvgFps ELSE AvgFps END
            `,
            args: [steamId, score, vod, accuracy, sens360, fov, fovScaling, avgFPS],
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
