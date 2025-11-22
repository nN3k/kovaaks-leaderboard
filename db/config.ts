import { column, defineDb, defineTable } from 'astro:db';

// https://astro.build/db/config


const Profile = defineTable({
  columns: {
    steamId: column.number(),
    steamName: column.text(),
    country: column.text({ default: '"/"' }),
    isBanned: column.boolean({ default: false }),
  }
})


//--------Layouts------------------------------
// Tables won't be used. Just to know the layout
const LeaderboardLayout = defineTable({
  columns: {
    playerSteamId: column.number({ references: () => Profile.columns.steamId }),
    rank: column.number(),
    score: column.number(),
    playerName: column.text({ references: () => Profile.columns.steamName })
  }
})

const LeaderboardSettingsLayout = defineTable({
  columns: {
    sense: column.number(),
    fov: column.number(),
    fovScaling: column.text(),
    avgFps: column.number(),
    country: column.text({ references: () => Profile.columns.country })
  }
})
//--------End of Layouts-----------------------

export default defineDb({
  tables: { Profile }
});
