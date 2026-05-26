import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import clientRoute from './routes/anas/client.js';
import exerciceRoute from './routes/anas/exercice.js';
import statRoute from './routes/anas/stat.js';

import homeRoutes from './routes/pahae/home.js';
import addFoodRoutes from './routes/pahae/addFood.js';
import addRecipeRoutes from './routes/pahae/addRecipe.js';
import clientsRoutes from './routes/pahae/clients.js';
import AIRoutes from './routes/pahae/ai.js';
import runnerRoutes from './routes/pahae/runner.js';

import authRoutes from './routes/jihane/auth.js';
import clientRoutes from './routes/jihane/client.js';
import coachRoutes from './routes/jihane/coach.js';
import chatRoutes from './routes/jihane/chat.js';

import coachRoute from './routes/zaynab/coach.js';
import inviteRoute from './routes/zaynab/invite.js';
import programRoute from './routes/zaynab/program.js';
import programCoachRoute from './routes/zaynab/programCoach.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/pahae/home/', homeRoutes);
app.use('/api/pahae/addFood/', addFoodRoutes);
app.use('/api/pahae/addRecipe/', addRecipeRoutes);
app.use('/api/pahae/clients/', clientsRoutes);
app.use('/api/pahae/ai/', AIRoutes);
app.use('/api/pahae/runner/', runnerRoutes);

app.use("/api/client", clientRoute);
app.use("/api/exercice", exerciceRoute);
app.use("/api/stat", statRoute);

app.use('/api/jihane/auth', authRoutes);
app.use('/api/jihane/clients', clientRoutes);
app.use('/api/jihane/coaches', coachRoutes);
app.use('/api/jihane/chat', chatRoutes);

app.use("/api/coach", coachRoute);
app.use("/api/invite", inviteRoute);
app.use("/api/program", programRoute);
app.use("/api/programCoach", programCoachRoute);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "voice")));

const rooms = {};
const socketToUserMap = {};

io.on("connection", (socket) => {

    socket.on("register-user", (userData) => {
        const userID = userData.userID;
        const firstname = userData.firstname || "Anonymous";
        const image = userData.image || null;

        if (!userID) return;

        socketToUserMap[socket.id] = {
            userID,
            firstname,
            image
        };
    });

    socket.on("join-room", (roomId) => {

        const userData = socketToUserMap[socket.id];
        if (!userData) return;

        if (socket.roomId) {
            socket.leave(socket.roomId);

            if (rooms[socket.roomId]) {
                rooms[socket.roomId] = rooms[socket.roomId].filter(
                    u => u.userID !== userData.userID
                );

                socket.to(socket.roomId).emit("user-left", userData);
            }
        }

        socket.join(roomId);
        socket.roomId = roomId;

        if (!rooms[roomId]) rooms[roomId] = [];

        const existingIndex = rooms[roomId].findIndex(
            u => u.userID === userData.userID
        );

        if (existingIndex >= 0) {
            rooms[roomId][existingIndex] = userData;
        } else {
            rooms[roomId].push(userData);
        }

        const others = rooms[roomId].filter(
            u => u.userID !== userData.userID
        );

        socket.emit("room-users", others);

        socket.to(roomId).emit("user-joined", userData);
    });

    socket.on("offer", (data) => {

        const targetSocketId = findSocketIdByUserId(data.to);
        const sender = socketToUserMap[socket.id];

        if (!targetSocketId || !sender) return;

        socket.to(targetSocketId).emit("offer", {
            offer: data.offer,
            from: sender.userID,
            firstname: sender.firstname,
            image: sender.image
        });
    });

    socket.on("answer", (data) => {

        const targetSocketId = findSocketIdByUserId(data.to);
        const sender = socketToUserMap[socket.id];

        if (!targetSocketId || !sender) return;

        socket.to(targetSocketId).emit("answer", {
            answer: data.answer,
            from: sender.userID,
            firstname: sender.firstname,
            image: sender.image
        });
    });

    socket.on("ice-candidate", (data) => {

        const targetSocketId = findSocketIdByUserId(data.to);
        const sender = socketToUserMap[socket.id];

        if (!targetSocketId || !sender) return;

        socket.to(targetSocketId).emit("ice-candidate", {
            candidate: data.candidate,
            from: sender.userID,
            firstname: sender.firstname,
            image: sender.image
        });
    });

    socket.on("disconnect", () => {

        const userData = socketToUserMap[socket.id];
        if (!userData) return;

        for (const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter(
                u => u.userID !== userData.userID
            );

            socket.to(roomId).emit("user-left", userData);
        }

        delete socketToUserMap[socket.id];
    });
});

function findSocketIdByUserId(userId) {
    for (const socketId in socketToUserMap) {
        if (socketToUserMap[socketId].userID === userId) {
            return socketId;
        }
    }
    return null;
}

const PORT = process.env.PORT 
server.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
});