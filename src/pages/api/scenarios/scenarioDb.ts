import { createClient } from "@libsql/client";

const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function ensureTableExists(tableName: string) {

    const result = await db.execute({
        sql: `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`,
        args: [tableName],
    });

    if (result.rows.length === 0) {
        // table does not exist, create it
        await db.execute(`
        CREATE TABLE "${tableName}" (
            id INTEGER PRIMARY KEY,
            SteamId TEXT NOT NULL,
            Score REAL NOT NULL DEFAULT 0,
            VOD TEXT DEFAULT "",
            CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
        `);
        await db.execute(`CREATE UNIQUE INDEX idx_${tableName}_steamid ON "${tableName}"(SteamId)`);
        await db.execute(`CREATE INDEX idx_${tableName}_score ON "${tableName}"(Score DESC, CreatedAt ASC)`);
    } else {
        // table exists, make sure VOD column exists
        const info = await db.execute({ sql: `PRAGMA table_info("${tableName}")` });
        const columns = info.rows.map(row => row[1]);
        if (!columns.includes("VOD")) {
        await db.execute(`ALTER TABLE "${tableName}" ADD COLUMN VOD TEXT DEFAULT ""`);
        }
    }
}