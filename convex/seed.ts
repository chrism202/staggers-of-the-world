import { mutation } from "./_generated/server";

const ATTENDEE_NAMES = [
  "Chris",
  "Mike",
  "Dave",
  "John",
  "Steve",
  "Tom",
  "Jake",
  "Ryan",
  "Matt",
  "Dan",
  "Nick",
  "Sam",
  "Ben",
  "Alex",
  "Max",
  "Luke",
  "Evan",
  "Cole",
  "Zach",
  "Kyle",
];

const CAR_OWNERS = ["Chris", "Mike", "Dave", "John", "Steve"];

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingAttendees = await ctx.db.query("attendees").first();
    if (existingAttendees) {
      return { status: "already_seeded" };
    }

    // Create cars first
    for (const owner of CAR_OWNERS) {
      await ctx.db.insert("cars", {
        ownerName: owner,
        ferryTime: undefined,
      });
    }

    // Create attendees
    for (const name of ATTENDEE_NAMES) {
      await ctx.db.insert("attendees", {
        name,
        carId: undefined,
      });
    }

    return { status: "seeded" };
  },
});
