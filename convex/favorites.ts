import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List all favorited Pokemon, ordered by creation time (newest first).
 */
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("favorites").order("desc").collect();
    },
});

/**
 * Add a Pokemon to favorites. Skips if already favorited.
 */
export const add = mutation({
    args: {
        pokemonId: v.number(),
        name: v.string(),
        spriteUrl: v.string(),
    },
    handler: async (ctx, args) => {
        // Check for duplicates
        const existing = await ctx.db
            .query("favorites")
            .withIndex("by_pokemonId", (q) => q.eq("pokemonId", args.pokemonId))
            .unique();

        if (existing) return existing._id;

        return await ctx.db.insert("favorites", {
            pokemonId: args.pokemonId,
            name: args.name,
            spriteUrl: args.spriteUrl,
        });
    },
});

/**
 * Remove a Pokemon from favorites by its PokeAPI ID.
 */
export const remove = mutation({
    args: { pokemonId: v.number() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("favorites")
            .withIndex("by_pokemonId", (q) => q.eq("pokemonId", args.pokemonId))
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});
