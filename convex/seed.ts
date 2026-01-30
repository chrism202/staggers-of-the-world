import { mutation } from "./_generated/server";

type EventDay = "friday" | "saturday" | "sunday";
type EventStatus = "confirmed" | "pending";

interface SeedEvent {
  title: string;
  day: EventDay;
  startTime: string;
  endTime?: string;
  location?: string;
  status: EventStatus;
}

const SEED_EVENTS: SeedEvent[] = [
  { title: "Dinner and drinks", day: "friday", startTime: "17:00", endTime: "20:00", location: "Wineport", status: "confirmed" },
  { title: "Last Ferry from Ardrossan", day: "friday", startTime: "18:00", endTime: "18:55", status: "confirmed" },
  { title: "Breakfast delivered", day: "saturday", startTime: "08:30", status: "confirmed" },
  { title: "Golf", day: "saturday", startTime: "09:30", endTime: "13:00", location: "Shiskine", status: "confirmed" },
  { title: "Sauna", day: "saturday", startTime: "14:00", endTime: "16:00", location: "Shiskine", status: "confirmed" },
  { title: "Start the Sesh", day: "saturday", startTime: "18:00", status: "confirmed" },
  { title: "Dinner", day: "saturday", startTime: "19:00", endTime: "21:00", location: "Ormidale", status: "confirmed" },
  { title: "Breakfast", day: "sunday", startTime: "10:00", endTime: "12:00", location: "Little Rock Cafe", status: "pending" },
];

const ATTENDEE_NAMES = [
  "Sean B",
  "Kerr S",
  "Allan I",
  "Bill L",
  "Euan M",
  "Fraser M",
  "James T",
  "Jamie M",
  "Jamie Y",
  "Joe S",
  "Jonny",
  "Matt L",
  "MH",
  "Robin U",
  "Ross G",
  "Ross M",
  "Stu L",
  "Chris M",
  "Stu M",
];

const CAR_NAMES = [
  "Chris M's car",
  "Shaggin Wagon",
  "Jamie Y's car",
  "Bill L's car",
  "James T's car",
  "Stu M's car",
  "Stu L's car",
];

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingAttendees = await ctx.db.query("attendees").first();
    if (existingAttendees) {
      return { status: "already_seeded" };
    }

    // Create cars first
    for (const name of CAR_NAMES) {
      await ctx.db.insert("cars", {
        name,
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

    // Create events
    for (const event of SEED_EVENTS) {
      await ctx.db.insert("events", event);
    }

    return { status: "seeded" };
  },
});

export const clearData = mutation({
  args: {},
  handler: async (ctx) => {
    const attendees = await ctx.db.query("attendees").collect();
    for (const attendee of attendees) {
      await ctx.db.delete(attendee._id);
    }

    const cars = await ctx.db.query("cars").collect();
    for (const car of cars) {
      await ctx.db.delete(car._id);
    }

    const events = await ctx.db.query("events").collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    return { status: "cleared" };
  },
});

export const resetCarAssignments = mutation({
  args: {},
  handler: async (ctx) => {
    // Unassign all passengers from cars
    const attendees = await ctx.db.query("attendees").collect();
    for (const attendee of attendees) {
      if (attendee.carId) {
        await ctx.db.patch(attendee._id, { carId: undefined });
      }
    }

    // Clear all ferry times
    const cars = await ctx.db.query("cars").collect();
    for (const car of cars) {
      if (car.ferryTime) {
        await ctx.db.patch(car._id, { ferryTime: undefined });
      }
    }

    return { status: "reset" };
  },
});

export const reseedEvents = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all events
    const events = await ctx.db.query("events").collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    // Reseed events
    for (const event of SEED_EVENTS) {
      await ctx.db.insert("events", event);
    }

    return { status: "reseeded" };
  },
});
