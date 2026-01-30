import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  attendees: defineTable({
    name: v.string(),
    carId: v.optional(v.id("cars")),
    golfingAbility: v.optional(
      v.union(
        v.literal("single_digit"),
        v.literal("mid_handicapper"),
        v.literal("high_handicapper"),
        v.literal("never_played")
      )
    ),
    bringingClubs: v.optional(v.boolean()),
  }).index("by_car", ["carId"]),

  cars: defineTable({
    name: v.string(),
    ferryTime: v.optional(v.string()),
    leavingFrom: v.optional(v.string()),
  }),

  events: defineTable({
    title: v.string(),
    day: v.union(v.literal("friday"), v.literal("saturday"), v.literal("sunday")),
    startTime: v.string(),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    status: v.union(v.literal("confirmed"), v.literal("pending")),
    notes: v.optional(v.string()),
  }).index("by_day", ["day"]),
});
