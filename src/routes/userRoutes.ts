import express from "express";
import {
  createUser,
  getUserById,
  deleteUserById,
  deleteAllUsers,
  getAllUsers,
} from "../controllers/userController";
const router = express.Router();

router.post("/users", createUser);
router.get("/users/:userId", getUserById);
router.get("/users", getAllUsers);
router.delete("/users/:userId", deleteUserById);
router.delete("/users", deleteAllUsers);

export default router;
