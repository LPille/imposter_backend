import { Server, Socket } from "socket.io";
import { Room } from "./models/Room";
import { User } from "./models/User";
import { IPlayer } from "./models/Room";

// Define a function to initialize WebSocket events
export function initSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("SE New user connected:", socket.id);

    // CREATE_ROOM Event
    socket.on("CREATE_ROOM", async (data, callback) => {
      const { roomId, userId } = data;

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
        socket.emit("ROOM_CREATED", newRoom);
        io.emit("ROOM_UPDATE", newRoom);
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
        socket.emit("ROOM_JOINED", room);
        io.to(roomId).emit("ROOM_UPDATE", room);
        if (typeof callback === "function") callback({ success: true });
      } else {
        if (typeof callback === "function")
          callback({ success: false, message: "Room or User not found" });
      }
    });

    // LEAVE_ROOM Event
    /*     socket.on("LEAVE_ROOM", async (data, callback) => {
      const { roomId, userId } = data;
      const room = await Room.findOne({ roomId });

      if (room) {
        room.players = room.players.filter(
          (player) => player.userId !== userId
        );
        await room.save();
        socket.leave(roomId);
        console.log("SE LEAVE_ROOM", roomId);
        io.to(roomId).emit("ROOM_UPDATE", room);

        // Remove room if empty
        if (room.players.length === 0) {
          await Room.deleteOne({ roomId });
        }

        if (typeof callback === "function") callback({ success: true });
      } else {
        if (typeof callback === "function")
          callback({ success: false, message: "Room not found" });
      }
    }); */

    //Logout Room and remove room when there is no player and remove the player
    socket.on("LOGOUT_ROOM", async (data, callback) => {
      const { roomId, userId } = data;
      const room = await Room.findOne({ roomId });
      if (room) {
        room.players = room.players.filter(
          (player) => player.userId !== userId
        );
        await room.save();

        //socket.emit("ROOM_UPDA", room);
        if (room.players.length === 0) {
          console.log("REMOVE ROOM");
          await Room.deleteOne({ roomId });
        }
        io.to(roomId).emit("ROOM_UPDATE", room);
        io.emit("ROOM_UPDATE", room);

        socket.leave(roomId);
        if (typeof callback === "function") callback({ success: true });
      }
    });

    socket.on("DELETE_ROOM", async (data, callback) => {
      const { roomId } = data;
      const room = await Room.findOne({ roomId });
      if (room) {
        await Room.deleteOne({ roomId });
        socket.emit("ROOM_DELETED", room.roomId);
        io.emit("ROOM_UPDATE", room);
        console.log("Event DELETE_ROOM", roomId);
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
