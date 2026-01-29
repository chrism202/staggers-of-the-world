import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cars").collect();
  },
});

export const listWithAttendees = query({
  args: {},
  handler: async (ctx) => {
    const cars = await ctx.db.query("cars").collect();
    const carsWithAttendees = await Promise.all(
      cars.map(async (car) => {
        const attendees = await ctx.db
          .query("attendees")
          .withIndex("by_car", (q) => q.eq("carId", car._id))
          .collect();
        return { ...car, attendees };
      })
    );
    return carsWithAttendees;
  },
});

export const assignFerryTime = mutation({
  args: {
    carId: v.id("cars"),
    ferryTime: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.carId, { ferryTime: args.ferryTime });
  },
});

export const clearFerryTime = mutation({
  args: {
    carId: v.id("cars"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.carId, { ferryTime: undefined });
  },
});
