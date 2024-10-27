import { Request, Response } from "express";
import { Room } from "../models/Room";
import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";

// Create a new Room
export const createRoom = async (req: Request, res: Response) => {
  /*   const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const roomId = uuidv4().slice(0, 4);
    const newRoom = new Room({
      roomId,
      players: [{ id: user.id, name: user.name, isImposter: false }],
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: "Error creating room", error });
  } */
};

// Join an existing room
export const joinRoom = async (req: Request, res: Response) => {
  /*   const { roomId, userId } = req.body;

  try {
    const room = await Room.findOne({ roomId });
    const user = await User.findById(userId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!room.players.find((player) => player.id === user.id)) {
      room.players.push({ id: user.id, name: user.name, isImposter: false });
      await room.save();
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Error joining room", error });
  } */
};

// Get room details
export const getRoom = async (req: Request, res: Response) => {
  console.log("req", req);

  const { roomId } = req.params;
  console.log("roomId", roomId);
  try {
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Error fetching room details", error });
  }
};

export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms", error });
  }
};
