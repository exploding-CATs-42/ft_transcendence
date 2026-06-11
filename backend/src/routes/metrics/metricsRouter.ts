import express from "express";
import { getMetricsController } from "../../controllers/metricsController";

export const metricsRouter = express.Router();

metricsRouter.get("/", getMetricsController);
