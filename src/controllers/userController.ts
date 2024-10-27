import { Request, Response } from "express";
import { User } from "../models/User";

export const createUser = async (req: Request, res: Response) => {
  const { name, userId } = req.body;
  //console.log("Create User ", userId);
  console.log("=== createUser", userId);

  try {
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      console.log("User already exists");
      return res.status(200).json(existingUser);
    }
    const newUser = new User({ userId, name });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { userId } = req.params;
  console.log("=== get user by id ", userId);
  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

export const deleteUserById = async (req: Request, res: Response) => {
  const { userId } = req.params;
  console.log("Delete User by Id", userId);
  try {
    const user = await User.findOneAndDelete({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("User deleted");
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// Route for delete all Users
export const deleteAllUsers = async (req: Request, res: Response) => {
  try {
    await User.deleteMany({});
    res.status(200).json({ message: "All users deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting all users", error });
  }
};

// Route for get all Users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};
