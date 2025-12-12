import type { APIRoute } from 'astro';
import { ensureTableExists, quoteSqlIdentifier } from './scenarioDb';
import { db } from "../../../utils/turso-client";
import { verifyApiKey } from '../../../../utils/api/key/manage-keys';
import config from '../../../data/config.json';

const baseUrl = import.meta.env.PROD ? import.meta.env.PUBLIC_NETLIFY_URL : import.meta.env.PUBLIC_LOCAL_URL;

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
        const { steamId, score, vod, accuracy, sens360, fov, fovScaling, avgFPS, scenarioName, scenarioId } = await request.json();

        if (!steamId || score == null || !vod || !scenarioName || !scenarioId || !accuracy) {
            console.error(`Missing data in request SteamID: ${steamId} ScenarioID: ${scenarioId} ScenarioName: ${scenarioName} Score: ${score} Vod: ${vod} Accuracy: ${accuracy}`);
            return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
        }

        const response = await fetch(
            `https://kovaaks.com/webapp-backend/leaderboard/scores/global?leaderboardId=${scenarioId}&page=0&max=${config.rank_cutoff}`
        );
        const scenarioData = await response.json();

        const userEntry = scenarioData.data.find((entry: any) => entry.steamId === steamId);
        if (!userEntry) {
            console.error("User entry not found in scenario data");
            return new Response(JSON.stringify({ error: "User entry not found in scenario data" }), { status: 404 });
        }


        const normalizedTableName = await ensureTableExists(scenarioName);

        const table = quoteSqlIdentifier(normalizedTableName);

        const safe = (v: any) => v === undefined ? null : v;
        await db.execute({
            sql: `
                INSERT INTO ${table} 
                    (SteamId, Score, Vod, Accuracy, Sens360, Fov, FovScaling, AvgFps)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(SteamId) DO UPDATE SET
                    Score = CASE
                        WHEN excluded.Score > Score THEN excluded.Score ELSE Score END,
                    Vod = CASE
                        WHEN excluded.Score > Score THEN excluded.Vod ELSE Vod END,
                    Accuracy = CASE
                        WHEN excluded.Score > Score THEN excluded.Accuracy ELSE Accuracy END,
                    Sens360 = CASE
                        WHEN excluded.Score > Score THEN excluded.Sens360 ELSE Sens360 END,
                    Fov = CASE
                        WHEN excluded.Score > Score THEN excluded.Fov ELSE Fov END,
                    FovScaling = CASE
                        WHEN excluded.Score > Score THEN excluded.FovScaling ELSE FovScaling END,
                    AvgFps = CASE
                        WHEN excluded.Score > Score THEN excluded.AvgFps ELSE AvgFps END
            `,
            args: [ safe(steamId), safe(score), safe(vod), safe(accuracy), safe(sens360), safe(fov), safe(fovScaling), safe(avgFPS) ]
        });

        // Count rows to enforce rank cutoff
        const countResult = await db.execute({
            sql: `SELECT COUNT(*) as cnt FROM ${table}`
        });
        const rowCount = Number(countResult.rows?.[0]?.[0] ?? 0);

        if (rowCount > config.rank_cutoff) {
            await db.execute({
                sql: `
                    DELETE FROM ${table}
                    WHERE id IN (
                        SELECT id FROM ${table}
                        ORDER BY Score ASC, CreatedAt ASC
                        LIMIT ?
                    )
                `,
                args: [rowCount - config.rank_cutoff],
            });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
