import { getEventSummaryService } from "../services/eventService.js";

export const getEventSummary = async (req, res, next) => {
  try {
    const summary = await getEventSummaryService();
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
};
