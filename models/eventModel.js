import pool from "../config/db.js";

export const findEventById = async (eventId) => {
  const result = await pool.query("SELECT * FROM events WHERE event_id = $1", [
    eventId,
  ]);
  return result.rows[0];
};

export const createEvent = async ({ eventId, name, totalSeats }) => {
  const result = await pool.query(
    `INSERT INTO events 
     (event_id, name, total_seats, available_seats, version)
     VALUES ($1, $2, $3, $3, 0)
     RETURNING *`,
    [eventId, name, totalSeats]
  );
  return result.rows[0];
};

export const getEventSummaryModel = async () => {
  const result = await pool.query(`
    SELECT 
      e.event_id AS "eventId",
      e.name,
      e.total_seats AS "totalSeats",
      e.available_seats AS "availableSeats",
      e.version,
      COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS "reservationCount"
    FROM events e
    LEFT JOIN reservations r ON r.event_id = e.event_id
    GROUP BY e.event_id
  `);

  return result.rows[0];
};
