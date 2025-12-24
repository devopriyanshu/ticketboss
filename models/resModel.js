import pool from "../config/db.js";

export const createReservationModel = async (
  client,
  { id, eventId, partnerId, seats }
) => {
  await client.query(
    `INSERT INTO reservations (id, event_id, partner_id, seats, status)
     VALUES ($1, $2, $3, $4, 'confirmed')`,
    [id, eventId, partnerId, seats]
  );
};

export const cancelReservationModel = async (id) => {
  const result = await pool.query(
    `UPDATE reservations
     SET status = 'cancelled'
     WHERE id = $1 AND status = 'confirmed'
     RETURNING seats`,
    [id]
  );
  return result.rows[0];
};

export const getAllReservationsModel = async () => {
  const result = await pool.query("SELECT * FROM reservations");
  return result.rows;
};
