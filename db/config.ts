import { column, defineDb, defineTable } from 'astro:db';


/*
I create this table in Turso dashboard manually to track scenario tables

await db.execute(`
  CREATE TABLE IF NOT EXISTS ${metaTable} (
    TableName TEXT PRIMARY KEY,      -- normalized table name
    OriginalName TEXT NOT NULL       -- original scenario name
  )
`);
*/


// https://astro.build/db/config


const profile = defineTable({
  columns: {
    steamId: column.text(),
    steamName: column.text(),
    country: column.text({ default: '"/"' }),
    isBanned: column.boolean({ default: false }),
  }
})



//--------Layouts------------------------------
// Tables won't be used. Just to know the layout
const leaderboard_layout = defineTable({
  columns: {
    playerSteamId: column.text({ references: () => profile.columns.steamId }),
    rank: column.number(),
    score: column.number(),
    playerName: column.text({ references: () => profile.columns.steamName })
  }
})

const leaderboard_settings_layout = defineTable({
  columns: {
    sense: column.number(),
    fov: column.number(),
    fovScaling: column.text(),
    avgFps: column.number(),
    country: column.text({ references: () => profile.columns.country })
  }
})
//--------End of Layouts-----------------------

export default defineDb({
  tables: { profile }
});
