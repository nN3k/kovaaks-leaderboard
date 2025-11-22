import { defineAction } from "astro:actions";
import { db, Profile } from "astro:db";
import { z } from "astro:schema";

export const server = {
    addProfile: defineAction({
        accept: "json",
        input: z.object({
            id: z.number(),
            name: z.string(),
        }),
        handler: async ({ id, name }) => {
            return await db.insert(Profile).values({
                steamId: id,
                steamName: name
            } );
        },
    }),
};