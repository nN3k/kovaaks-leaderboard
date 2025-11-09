import { db, Profile } from 'astro:db';

export type InsertProfileParams = typeof Profile.$inferInsert;

export async function insertProfile(profileData: InsertProfileParams) {
  try {
    console.log('Attempting to insert profile:', profileData);
    
    // Try to insert the data
    const result = await db.insert(Profile).values(profileData).run();
    
    console.log('Insert successful');
    return result;
  } catch (error) {
    console.error('Error inserting profile:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    throw error;
  }
}

// Function to check if database is accessible
export async function checkDatabaseConnection() {
  try {
    // Try a simple select query to check connection
    const result = await db.select().from(Profile).limit(1).all();
    return { connected: true, data: result };
  } catch (error) {
    return { connected: false, error };
  }
}