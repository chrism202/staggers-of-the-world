import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  attendees: defineTable({
    name: v.string(),
    carId: v.optional(v.id("cars")),
  }).index("by_car", ["carId"]),

  cars: defineTable({
    ownerName: v.string(),
    ferryTime: v.optional(v.string()),
  }),
});
