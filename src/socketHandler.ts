import { Server, Socket } from "socket.io";
import { Room } from "./models/Room";
import { User } from "./models/User";
import { IPlayer } from "./models/Room";

// Define a function to initialize WebSocket events
export function initSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("New user connected:", socket.id);

    // CREATE_ROOM Event
    socket.on("CREATE_ROOM", async (data, callback) => {
      const { roomId, userId } = data;
      console.log("CREATE_ROOM: ", data);

      const user = await User.findOne({ userId });
      if (user) {
        const newPlayer: Partial<IPlayer> = {
          userId: user.userId,
          name: user.name,
          isImposter: false,
          isInGame: false,
        };

        const newRoom = new Room({
          roomId,
          players: [newPlayer],
          gameRunning: false,
        });

        await newRoom.save();
        socket.join(roomId);
        console.log("1. Room updated", newRoom);

        io.to(roomId).emit("ROOM_UPDATED", newRoom);
        if (typeof callback === "function") callback({ roomId });
      } else {
        if (typeof callback === "function")
          callback({ success: false, message: "User not found" });
      }
    });

    // JOIN_ROOM Event
    socket.on("JOIN_ROOM", async (data, callback) => {
      const { roomId, userId } = data;
      const room = await Room.findOne({ roomId });
      const user = await User.findOne({ userId }).lean();

      if (room && user) {
        const existingPlayer = room.players.find(
          (player) => player.userId === user.userId
        );

        if (!existingPlayer) {
          const newPlayer: Partial<IPlayer> = {
            userId: user.userId,
            name: user.name,
            isImposter: false,
            isInGame: true,
          };
          room.players.push(newPlayer as IPlayer);
          await room.save();
        }

        socket.join(roomId);
        console.log("2. Room updated", room);
        io.to(roomId).emit("ROOM_UPDATED", room);
        if (typeof callback === "function") callback({ success: true });
      } else {
        if (typeof callback === "function")
          callback({ success: false, message: "Room or User not found" });
      }
    });

    // LEAVE_ROOM Event
    socket.on("LEAVE_ROOM", async (data, callback) => {
      const { roomId, userId } = data;
      const room = await Room.findOne({ roomId });

      if (room) {
        room.players = room.players.filter(
          (player) => player.userId !== userId
        );
        await room.save();
        socket.leave(roomId);
        console.log("3. Room updated", room);
        io.to(roomId).emit("ROOM_UPDATED", room);

        // Remove room if empty
        if (room.players.length === 0) {
          await Room.deleteOne({ roomId });
        }

        if (typeof callback === "function") callback({ success: true });
      } else {
        if (typeof callback === "function")
          callback({ success: false, message: "Room not found" });
      }
    });

    // START_GAME Event
    socket.on("START_GAME", async (data, callback) => {
      const { roomId } = data;
      const room = await Room.findOne({ roomId });

      if (room) {
        room.gameRunning = true;
        await room.save();

        io.to(roomId).emit("GAME_STARTED", room);
        if (typeof callback === "function") callback({ success: true });
      } else {
        if (typeof callback === "function")
          callback({ success: false, message: "Room not found" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
