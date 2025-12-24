import { Router } from "express";
import reservationRoutes from "./routes/resRoutes.js";

const router = Router();

router.use("/reservations", reservationRoutes);

export default router;
