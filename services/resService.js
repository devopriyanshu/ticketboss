import { v4 as uuid } from "uuid";
import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import {
  createReservationModel,
  cancelReservationModel,
  getAllReservationsModel,
} from "../models/resModel.js";

const EVENT_ID = "node-meetup-2025";

export const reserveSeatsService = async ({ partnerId, seats }) => {
  if (!partnerId || seats <= 0 || seats > 10) {
    throw new ApiError(400, "Invalid seat request");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const eventRes = await client.query(
      "SELECT * FROM events WHERE event_id = $1",
      [EVENT_ID]
    );
    const event = eventRes.rows[0];

    const updateRes = await client.query(
      `UPDATE events
       SET available_seats = available_seats - $1,
           version = version + 1
       WHERE event_id = $2
         AND version = $3
         AND available_seats >= $1`,
      [seats, EVENT_ID, event.version]
    );

    if (updateRes.rowCount === 0) {
      throw new ApiError(409, "Not enough seats left");
    }

    const reservationId = uuid();
    await createReservationModel(client, {
      id: reservationId,
      eventId: EVENT_ID,
      partnerId,
      seats,
    });

    await client.query("COMMIT");

    return {
      reservationId,
      seats,
      status: "confirmed",
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const cancelReservationService = async (reservationId) => {
  const cancelled = await cancelReservationModel(reservationId);
  if (!cancelled) {
    throw new ApiError(404, "Reservation not found");
  }

  await pool.query(
    `UPDATE events
     SET available_seats = available_seats + $1,
         version = version + 1`,
    [cancelled.seats]
  );
};

export const listReservationsService = async () => {
  return getAllReservationsModel();
};
