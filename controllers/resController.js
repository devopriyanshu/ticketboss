import {
  reserveSeatsService,
  cancelReservationService,
  listReservationsService,
} from "../services/resService.js";

export const reserveSeats = async (req, res, next) => {
  try {
    const result = await reserveSeatsService(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const cancelReservation = async (req, res, next) => {
  try {
    await cancelReservationService(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const listReservations = async (req, res, next) => {
  try {
    const reservations = await listReservationsService();
    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
};
