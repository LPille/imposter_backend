import express from "express";
import {
  createRoom,
  joinRoom,
  getRoom,
  getAllRooms,
} from "../controllers/roomController";
const router = express.Router();

router.post("/rooms", createRoom);
router.post("/rooms/join", joinRoom);
router.get("/rooms/:roomId", getRoom);
router.get("/rooms", getAllRooms);

export default router;
