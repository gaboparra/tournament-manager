import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import { setSocketServer } from "./config/socket.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import tournamentRoutes from "./routes/tournament.routes.js";
import teamRoutes from "./routes/team.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import matchRoutes from "./routes/match.routes.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.corsOrigin,
  },
});

io.on("connection", (socket) => {
  console.log("Connected client:", socket.id);

  socket.on("join-tournament", (tournamentId: string) => {
    socket.join(`tournament:${tournamentId}`);
    console.log(`Socket ${socket.id} se unió al torneo ${tournamentId}`);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected client:", socket.id);
  });
});
setSocketServer(io);

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api", registrationRoutes);
app.use("/api/", matchRoutes);
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use(errorHandler);

httpServer.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
