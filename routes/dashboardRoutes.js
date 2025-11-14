import express from "express";
import {
  createDashboard,
  getDashboards,
  deleteDashboard
} from "../controllers/dashboardController.js";

const router = express.Router();

router.post("/", createDashboard);
router.get("/", getDashboards);
router.delete("/:id", deleteDashboard);

export default router;
