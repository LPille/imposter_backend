import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

// Types for User
interface User {
  socketId: string;
  name: string;
  id: string;
}

// App setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (for development purposes)
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Game state
let users: User[] = [];
let currentWord: string = "";
let imposter: User | null = null;
let gameIsRunning: boolean = false;

const normal: string[] = require("./data/normal.json");
const wild: string[] = require("./data/wild.json");

// Define Game Modes (if needed)
enum GameMode {
  Normal = 1,
  Wild = 2,
}

let gameMode: GameMode = GameMode.Normal;

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  socket.on("SEND_LOGIN_REQUEST", (user: { name: string; id: string }) => {
    console.log("login new User: ", user);
    const newUser: User = { socketId: socket.id, name: user.name, id: user.id };
    users.push(newUser);
    io.to(socket.id).emit("LOGIN_REQUEST_ACCEPTED", user);
    io.emit("UPDATE_USERS", users);
  });

  socket.on("STOP_GAME", () => {
    console.log("STOP_GAME");
    gameIsRunning = false;
    io.emit("GAME_STOPPED");
  });

  socket.on("START_GAME", () => {
    console.log("START_GAME and set Game data ");
    imposter = users[Math.floor(Math.random() * users.length)];
    currentWord = normal[Math.floor(Math.random() * normal.length)];
    gameIsRunning = true;

    io.emit("GAME_INFO", { currentWord, imposter });
  });

  socket.on("NEXT_ROUND", () => {
    imposter = users[Math.floor(Math.random() * users.length)];
    currentWord = normal[Math.floor(Math.random() * normal.length)];

    io.emit("GAME_INFO", { currentWord, imposter });
  });

  socket.on("LOGOUT", () => {
    console.log("LOGOUT");
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("UPDATE_USERS", users);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("UPDATE_USERS", users); // Ensure the event name is consistent
  });
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
