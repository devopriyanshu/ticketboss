import {
  findEventById,
  createEvent,
  getEventSummaryModel,
} from "../models/eventModel.js";
import ApiError from "../utils/ApiError.js";

const SEED_EVENT = {
  eventId: "node-meetup-2025",
  name: "Node.js Meet-up",
  totalSeats: 500,
};

export const seedEventIfNotExists = async () => {
  const exists = await findEventById(SEED_EVENT.eventId);

  if (!exists) {
    await createEvent(SEED_EVENT);
    console.log("✅ Event seeded on startup");
  } else {
    console.log("ℹ️ Event already exists, skipping seed");
  }
};

export const getEventSummaryService = async () => {
  const summary = await getEventSummaryModel();

  if (!summary) {
    throw new ApiError(404, "Event not initialized");
  }

  return summary;
};
