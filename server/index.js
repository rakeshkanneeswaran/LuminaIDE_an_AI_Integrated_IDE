const { Server: SocketServer } = require("socket.io");
const express = require("express");
const http = require("http");
var pty = require("node-pty");

const app = express();
const server = http.createServer(app);
const ptyProcess = pty.spawn("bash", [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: process.env.INIT_CWD,
  env: process.env,
});
const io = new SocketServer({
  cors: "*",
});
io.attach(server);

ptyProcess.onData((data) => {
  io.emit("terminal:data", data);
  console.log(data)
});

io.on("connection", (socket) => {
  console.log("socket connected with id " + socket.id);

  socket.on("terminal:write", (data) => {
    ptyProcess.write(data);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected with id " + socket.id);
  });
});

server.listen("9000", () => {
  console.log("🐳 docker is listen on port 9000");
});
