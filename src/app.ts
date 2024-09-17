import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

interface User {
  socketId: string;
  name: string;
  id: string;
}

interface Player {
  id: string;
  name: string;
  isImposter?: boolean;
}

interface Room {
  roomId: string;
  players: Player[];
}

let users: User[] = [];
let currentWord = "";
let imposter: User | null = null;
let gameMode = 1;

const gameModes = {
  normal: 1,
  wild: 2,
};

let rooms: { [key: string]: Room } = {};
let gameIsRunning = false;

const normal = require("../data/normal.json");
const wild = require("../data/wild.json");

io.on("connection", (socket) => {
  console.log("User connected: SocketID", socket.id);

  socket.on(
    "CREATE_ROOM",
    (name: string, callback: (data: { roomId: string }) => void) => {
      const roomId = uuidv4().slice(0, 4);
      console.log("New Room id : ", roomId);

      rooms[roomId] = {
        roomId,
        players: [{ id: socket.id, name }],
      };
      socket.join(roomId);
      callback({ roomId });
      io.to(roomId).emit("room-updated", rooms[roomId]);
    }
  );

  socket.on(
    "JOIN_ROOM",
    (
      roomId: string,
      name: string,
      callback: (data: { success: boolean; message?: string }) => void
    ) => {
      console.log("JOIN_ROOM: ", roomId, " from ", name);
      if (rooms[roomId]) {
        rooms[roomId].players.push({ id: socket.id, name });
        socket.join(roomId);
        callback({ success: true });
        io.to(roomId).emit("room-updated", rooms[roomId]);
      } else {
        callback({ success: false, message: "Room not found" });
      }
    }
  );

  socket.on("SEND_LOGIN_REQUEST", (user: { name: string; id: string }) => {
    console.log("login new User: ", user);
    users.push({ socketId: socket.id, name: user.name, id: user.id });
    io.to(socket.id).emit("LOGIN_REQUEST_ACCEPTED", user);
    io.emit("UPDATE_USERS", users);
  });

  socket.on("STOP_GAME", () => {
    console.log("STOP_GAME");
    gameIsRunning = false;
    io.emit("GAME_STOPPED");
  });

  socket.on("START_GAME", (roomId: string) => {
    console.log("Start Game");

    const room = rooms[roomId];
    if (room) {
      const newWord = normal[Math.floor(Math.random() * normal.length)];
      const imposterIndex = Math.floor(Math.random() * room.players.length);
      room.players.forEach((player, index) => {
        player.isImposter = index === imposterIndex;
        io.to(player.id).emit(
          "WORD_ASSIGNED",
          player.isImposter ? "Imposter" : newWord
        );
      });
      io.to(roomId).emit("GAME_STARTED");
    }
  });

  socket.on("START_GAME", () => {
    console.log("START_GAME and set Game data ");
    imposter = users[Math.floor(Math.random() * users.length)];
    currentWord = normal[Math.floor(Math.random() * normal.length)];
    gameIsRunning = true;
    io.emit("GAME_INFO", { currentWord, imposter });
  });

  socket.on("NEXT_ROUND", () => {
    console.log("                      ");
    console.log("----- NEXT_ROUND -----");
    imposter = users[Math.floor(Math.random() * users.length)];
    currentWord = normal[Math.floor(Math.random() * normal.length)];
    console.log("Imposter", imposter);

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
    io.emit("updateUsers", users);
  });
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
