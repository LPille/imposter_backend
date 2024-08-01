const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

let users = [];
let currentWord = "";
let imposterId = "";
let imposter = {};
let gameMode = 1;

let gameModes = {
  normal: 1,
  wild: 2,
};

let gameIsRunning = false;

const normal = require("./data/normal.json");
const wild = require("./data/wild.json");

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("SEND_LOGIN_REQUEST", (user) => {
    console.log("login new User: ", user);
    users.push({ socketId: socket.id, name: user.name, id: user.id });
    // add socketID to user object
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
    // SEnd game settings to all users with imposter id and current word
    io.emit("GAME_INFO", { currentWord, imposter });

    /*     io.to(imposterId).emit("GET_CURRENT_WORD", "Imposter");
    console.log("Send words to other users ");
    users.forEach((user) => {
      if (user.socketId !== imposterId) {
        io.to(user.socketId).emit("GET_CURRENT_WORD", currentWord);
      }
    }); */
  });

  socket.on("NEXT_ROUND", () => {
    console.log("                      ");
    console.log("----- NEXT_ROUND -----");
    imposter = users[Math.floor(Math.random() * users.length)];
    currentWord = normal[Math.floor(Math.random() * normal.length)];
    console.log("imposter", imposter);
    console.log("imposter", imposter);

    io.emit("GAME_INFO", { currentWord, imposter });

    //io.to(imposter.id).emit("SET_CURRENT_WORD", "Imposter");
    /*    console.log("Send words to other users ");
    users.forEach((user) => {
      if (user.socketId !== imposterId) {
        io.to(user.socketId).emit("GET_CURRENT_WORD", currentWord);
      }
    }); */
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
