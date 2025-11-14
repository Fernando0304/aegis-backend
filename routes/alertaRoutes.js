import express from "express";
import { listarAlertas } from "../controllers/alertaController.js";
import { proteger } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", proteger, listarAlertas);

export default router;
