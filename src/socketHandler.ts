import { Server, Socket } from "socket.io";
import { Game } from "./models/Game";
import { User } from "./models/User";
import { IPlayer } from "./models/Game";

// Define a function to initialize WebSocket events
export function initSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Socket new connection: ", socket.id);

    // CREATE_GAME Event
    socket.on("CREATE_GAME", async (data, callback) => {
      const { gameId, userId } = data;

      const user = await User.findOne({ userId });
      if (user) {
        const newPlayer: Partial<IPlayer> = {
          userId: user.userId,
          name: user.name,
          isImposter: false,
          isInGame: false,
        };

        const newGame = new Game({
          gameId,
          players: [newPlayer],
          gameRunning: false,
          word: "",
          admin: newPlayer,
        });

        await newGame.save();
        socket.join(gameId);
        socket.emit("GAME_CREATED", newGame);
        io.emit("GAME_UPDATE", newGame);
        if (typeof callback === "function") callback({ gameId });
      } else {
        if (typeof callback === "function")
          callback({ success: false, message: "User not found" });
      }
    });

    // JOIN_GAME Event
    socket.on("JOIN_GAME", async (data, callback) => {
      const { gameId, userId } = data;
      const game = await Game.findOne({ gameId });
      const user = await User.findOne({ userId }).lean();

      if (game && user) {
        const existingPlayer = game.players.find(
          (player) => player.userId === user.userId
        );

        if (!existingPlayer) {
          const newPlayer: Partial<IPlayer> = {
            userId: user.userId,
            name: user.name,
            isImposter: false,
            isInGame: true,
          };
          game.players.push(newPlayer as IPlayer);
          await game.save();
        }

        socket.join(gameId);
        socket.emit("GAME_JOINED", game);
        io.to(gameId).emit("GAME_UPDATE", game);
        if (typeof callback === "function") callback({ success: true });
      } else {
        if (typeof callback === "function")
          callback({ success: false, message: "Game or User not found" });
      }
    });

    //Logout Game and remove game when there is no player and remove the player
    socket.on("LOGOUT_GAME", async (data, callback) => {
      const { gameId: gameId, userId } = data;
      const game = await Game.findOne({ gameId: gameId });
      if (game) {
        game.players = game.players.filter(
          (player) => player.userId !== userId
        );
        await game.save();

        //socket.emit("ROOM_UPDA", room);
        if (game.players.length === 0) {
          console.log("Socket remove game after Logout ");
          await Game.deleteOne({ gameId: gameId });
        }
        io.to(gameId).emit("GAME_UPDATE", game);
        io.emit("GAME_UPDATE", game);

        socket.leave(gameId);
        if (typeof callback === "function") callback({ success: true });
      }
    });

    socket.on("DELETE_GAME", async (data, callback) => {
      const { gameId } = data;
      const game = await Game.findOne({ gameId });
      if (game) {
        await Game.deleteOne({ gameId });
        socket.emit("GAME_DELETED", game.gameId);
        io.emit("GAME_UPDATE", game);
        if (typeof callback === "function") callback({ success: true });
      } else {
        if (typeof callback === "function")
          callback({ success: false, message: "Game not found" });
      }
    });

    // START_GAME Event
    socket.on("START_GAME", async (data, callback) => {
      const { gameId } = data;
      const game = await Game.findOne({ gameId });

      if (game) {
        game.gameRunning = true;
        await game.save();
        io.to(gameId).emit("GAME_STARTED", game);
        if (typeof callback === "function") callback({ success: true });
      } else {
        if (typeof callback === "function")
          callback({ success: false, message: "Game not found" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket User disconnected:", socket.id);
    });
  });
}
