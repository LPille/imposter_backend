import { Request, Response } from "express";
import { Game } from "../models/Game";
import { User } from "../models/User";
import { v4 as uuidv4 } from "uuid";

// Create a new Game
export const createGame = async (req: Request, res: Response) => {
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
export const joinGame = async (req: Request, res: Response) => {
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

// Get game details
export const getGame = async (req: Request, res: Response) => {
  const { gameId } = req.params;
  try {
    const game = await Game.findOne({ gameId });
    if (!game) return res.status(404).json({ message: "Game not found" });
    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ message: "Error fetching game details", error });
  }
};

export const getAllGames = async (req: Request, res: Response) => {
  try {
    const games = await Game.find();
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ message: "Error fetching games", error });
  }
};
/* 
export const logOutFromRoom = async (req: Request, res: Response) => {
  const { roomId, userId } = req.body;
}; */
