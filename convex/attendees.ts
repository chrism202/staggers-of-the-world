import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("attendees").collect();
  },
});

export const assignToCar = mutation({
  args: {
    attendeeId: v.id("attendees"),
    carId: v.id("cars"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.attendeeId, { carId: args.carId });
  },
});

export const removeFromCar = mutation({
  args: {
    attendeeId: v.id("attendees"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.attendeeId, { carId: undefined });
  },
});

export const updateGolfInfo = mutation({
  args: {
    attendeeId: v.id("attendees"),
    golfingAbility: v.optional(
      v.union(
        v.literal("single_digit"),
        v.literal("mid_handicapper"),
        v.literal("high_handicapper"),
        v.literal("never_played")
      )
    ),
    bringingClubs: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.attendeeId, {
      golfingAbility: args.golfingAbility,
      bringingClubs: args.bringingClubs,
    });
  },
});
