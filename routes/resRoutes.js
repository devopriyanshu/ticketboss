import { Router } from "express";
import {
  reserveSeats,
  cancelReservation,
  listReservations,
} from "../controllers/resController.js";
import { getEventSummary } from "../controllers/eventController.js";

const router = Router();
router.get("/", getEventSummary);
router.post("/", reserveSeats);
router.delete("/:id", cancelReservation);
router.get("/all", listReservations);

export default router;
