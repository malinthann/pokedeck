import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    favorites: defineTable({
        pokemonId: v.number(),
        name: v.string(),
        spriteUrl: v.string(),
    }).index("by_pokemonId", ["pokemonId"]),
});
