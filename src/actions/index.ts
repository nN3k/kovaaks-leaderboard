import { defineAction } from "astro:actions";
import { db, Profile } from "astro:db";
import { z } from "astro:schema";

export const server = {
    addProfile: defineAction({
        accept: "form",
        input: z.object({
            id: z.string(),
            name: z.string(),
        }),
        handler: async ({ id, name }) => {
            //await db.insert(Profile).values({ id, name });
            return true;
        },
    }),
};