const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const Actions = require("./src/actions");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 5000;

app.use(express.static("build"));

app.use((req, res, next) => {
	res.sendFile(path.join(__dirname, "build", "index.html"));
});

const userSocketMap = {};
const getAllConnectedClients = (roomId) => {
	return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
		(socketId) => {
			return {
				socketId,
				username: userSocketMap[socketId],
			};
		}
	);
};
io.on("connection", (socket) => {
	console.log("socket.id", socket.id);

	socket.on(Actions.JOIN, ({ roomId, username }) => {
		userSocketMap[socket.id] = username;
		socket.join(roomId);
		const clients = getAllConnectedClients(roomId);
		clients.forEach(({ socketId }) =>
			io.to(socketId).emit(Actions.JOINED, {
				clients,
				username,
				socketId: socket.id,
			})
		);
	});

	socket.on(Actions.CODE_CHANGE, ({ roomId, code }) => {
		socket.in(roomId).emit(Actions.CODE_CHANGE, {
			code,
		});
	});

	socket.on(Actions.SYNC_CODE, ({ socketId, code }) => {
		io.to(socketId).emit(Actions.CODE_CHANGE, {
			code,
		});
	});

	socket.on("disconnecting", () => {
		const rooms = [...socket.rooms];
		rooms.forEach((roomId) => {
			socket.in(roomId).emit(Actions.DISCONNECTED, {
				socketId: socket.id,
				username: userSocketMap[socket.id],
			});
		});
		delete userSocketMap[socket.id];
		socket.leave();
	});
});

server.listen(PORT, () => console.log(`Listening on ${5000}`));
