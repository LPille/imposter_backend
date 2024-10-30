import express, { Express, Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import gameRoutes from "./routes/gameRoutes";
import userRoutes from "./routes/userRoutes";
import dotenv from "dotenv";
import databaseConnection from "./setupDatabase";
import { initSocketHandlers } from "./socketHandler";
const app = express();

app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

dotenv.config();
databaseConnection();

const port = process.env.PORT;

app.use(express.json());
app.use("/api", gameRoutes);
app.use("/api", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Imposter Server");
});

initSocketHandlers(io);

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
