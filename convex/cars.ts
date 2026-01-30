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

export const addCar = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const carId = await ctx.db.insert("cars", {
      name: args.name,
      ferryTime: undefined,
    });
    return carId;
  },
});

export const removeCar = mutation({
  args: {
    carId: v.id("cars"),
  },
  handler: async (ctx, args) => {
    // Reassign all passengers to unassigned (remove from car)
    const passengers = await ctx.db
      .query("attendees")
      .withIndex("by_car", (q) => q.eq("carId", args.carId))
      .collect();

    for (const passenger of passengers) {
      await ctx.db.patch(passenger._id, { carId: undefined });
    }

    // Delete the car
    await ctx.db.delete(args.carId);
  },
});

export const setLeavingFrom = mutation({
  args: {
    carId: v.id("cars"),
    leavingFrom: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.carId, {
      leavingFrom: args.leavingFrom || undefined,
    });
  },
});
