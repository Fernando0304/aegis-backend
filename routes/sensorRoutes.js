import express from "express";
import {
  listarSensores,
  obterSensor,
  criarSensor,
  atualizarSensor,
  deletarSensor
} from "../controllers/sensorController.js";

const router = express.Router();

// CRUD
router.get("/", listarSensores);
router.get("/:nome", obterSensor);
router.post("/", criarSensor);
router.put("/:id", atualizarSensor);
router.delete("/:id", deletarSensor);

export default router;
