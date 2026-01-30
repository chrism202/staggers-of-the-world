import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    day: v.union(v.literal("friday"), v.literal("saturday"), v.literal("sunday")),
    startTime: v.string(),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    status: v.union(v.literal("confirmed"), v.literal("pending")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    day: v.optional(v.union(v.literal("friday"), v.literal("saturday"), v.literal("sunday"))),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    status: v.optional(v.union(v.literal("confirmed"), v.literal("pending"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
