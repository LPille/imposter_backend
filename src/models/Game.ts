import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface IPlayer extends IUser {
  isImposter: boolean;
  isInGame: boolean;
}

const PlayerSchema: Schema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  isImposter: { type: Boolean, default: false },
  isInGame: { type: Boolean, default: false },
});

export const Player = mongoose.model<IPlayer>("Player", PlayerSchema);

export interface IGame extends Document {
  gameId: string;
  players: IPlayer[];
  gameRunning: boolean;
  admin: IPlayer;
  word?: string;
  imposter?: string[];
}

const GameSchema: Schema = new Schema({
  gameId: { type: String, required: true, unique: true },
  players: [PlayerSchema],
  gameRunning: { type: Boolean, default: false },
  admin: PlayerSchema,
  word: { type: String },
  imposter: [{ type: String }],
});

export const Game = mongoose.model<IGame>("Game", GameSchema);
