import express from "express";
import {
  createGame,
  joinGame,
  getGame,
  getAllGames,
} from "../controllers/gameController";
const router = express.Router();

router.post("/games", createGame);
router.post("/games/join", joinGame);
router.get("/games/:gameId", getGame);
router.get("/games", getAllGames);

export default router;
