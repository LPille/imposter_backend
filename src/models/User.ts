import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userId: string;
  name: string;
}

const UserSchema: Schema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
});

export const User = mongoose.model<IUser>("User", UserSchema);
