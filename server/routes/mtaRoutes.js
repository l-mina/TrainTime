import express from "express";

import { getStationData } from "../controllers/mtaController.js";

const router = express.Router();

// Controllers 

router.get("/station-data", getStationData);

export default router;