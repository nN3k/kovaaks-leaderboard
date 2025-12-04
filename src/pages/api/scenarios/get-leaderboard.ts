// src/pages/api/scenarios/get-leaderboard.ts
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { scenarioName } = await request.json();
    
    if (!scenarioName) {
      return new Response(JSON.stringify([]), { status: 400 });
    }

    const { db, normalizeScenarioName } = await import("./scenarioDb");
    const tableName = normalizeScenarioName(scenarioName);
    
    // OPTIMAL QUERY: Single JOIN with proper column names
    const query = `
        SELECT 
            l.Score as score,
            COALESCE(p.SteamName, l.SteamId) as player
        FROM "${tableName}" l
        LEFT JOIN profiles p ON l.SteamId = p.SteamId
        WHERE l.Score IS NOT NULL
        ORDER BY l.Score DESC
        LIMIT 50;
    `;
    
    const result = await db.execute({ sql: query });
    const leaderboard = result.rows.map(row => [row.score, row.player]);
    
    return new Response(
      JSON.stringify(leaderboard),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify([]));
  }
};