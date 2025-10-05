import express from "express";
import { haloRespond } from "../controllers/HaloControllers";

const botRouter = express.Router();

botRouter.post("/chat", haloRespond);

export default botRouter;
