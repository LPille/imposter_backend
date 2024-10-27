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

export interface IRoom extends Document {
  roomId: string;
  players: IPlayer[];
  gameRunning: boolean;
}

const RoomSchema: Schema = new Schema({
  roomId: { type: String, required: true, unique: true },
  players: [PlayerSchema],
  gameRunning: { type: Boolean, default: false },
});

export const Room = mongoose.model<IRoom>("Room", RoomSchema);
