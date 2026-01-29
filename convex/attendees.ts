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
