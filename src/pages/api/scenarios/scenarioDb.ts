import { createClient } from "@libsql/client";
import crypto from "crypto";

export const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});


const metaTable = quoteSqlIdentifier("ScenarioNames");


/**
 * Safely quotes an SQL identifier (table or column name)
 * by doubling internal quotes and wrapping in double quotes.
 */
export function quoteSqlIdentifier(name: string): string {
    const escaped = name.replace(/"/g, '""');
    return `"${escaped}"`;
}

export function normalizeScenarioName(rawName: string): string {
  const safeName = rawName.replace(/[^a-zA-Z0-9_\-+@|~]/g, "_");
  const hash = crypto.createHash("sha1").update(rawName).digest("hex").slice(0, 8);
  const maxLength = 50;
  const truncated = safeName.length > maxLength ? safeName.slice(0, maxLength) : safeName;
  
  // If the name starts with a number, prefix it with a letter
  const finalName = /^\d/.test(truncated) ? `table_${truncated}` : truncated;
  
  return `${finalName}_${hash}`;
}


export async function getOriginalScenarioName(normalizedName: string): Promise<string | null> {

    const result = await db.execute({
        sql: `SELECT OriginalName FROM ${metaTable} WHERE NormalizedName = ?`,
        args: [normalizedName],
    });

    const value = result.rows?.[0]?.[0];

    if (typeof value === "string") {
        return value;
    }

    return null;
}


export async function ensureTableExists(scenarioName: string) {

    await db.execute(`
        CREATE TABLE IF NOT EXISTS ${metaTable} (
            NormalizedName TEXT PRIMARY KEY,
            OriginalName TEXT NOT NULL
        )
    `);

    const normalizedName = normalizeScenarioName(scenarioName);

    const table = quoteSqlIdentifier(normalizedName);
    const indexSteam = quoteSqlIdentifier(`idx_${normalizedName}_steamid`);
    const indexScore = quoteSqlIdentifier(`idx_${normalizedName}_score`);

    // Create the scenario table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS ${table} (
            id INTEGER PRIMARY KEY,
            SteamId TEXT NOT NULL,
            Score REAL NOT NULL DEFAULT 0,
            VOD TEXT DEFAULT "",
            CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create indexes
    await db.execute(`
        CREATE UNIQUE INDEX IF NOT EXISTS ${indexSteam} ON ${table} (SteamId)
    `);
    await db.execute(`
        CREATE INDEX IF NOT EXISTS ${indexScore} ON ${table} (Score DESC, CreatedAt ASC)
    `);

    // Insert mapping into ScenarioMeta table
    await db.execute({
        sql: `
            INSERT OR IGNORE INTO ${metaTable} (NormalizedName, OriginalName)
            VALUES (?, ?)
        `,
        args: [normalizedName, scenarioName]
    });

    return normalizedName;
}
