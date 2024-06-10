const { Server: SocketServer } = require("socket.io");
const chokidar = require('chokidar');
const express = require("express");
const http = require("http");
const pty = require("node-pty");
const fs = require("fs/promises");
const path = require("path");
const cors = require('cors')

chokidar.watch('./user').on('all', (event, path) => {
    io.emit('file:refresh',path)
  });
const app = express();
app.use(cors())
const server = http.createServer(app);
const ptyProcess = pty.spawn("bash", [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: process.env.INIT_CWD + "/user",
  env: process.env,
});

// ----------------------------------------------------------------

app.get("/files", async (req,res)=>{
    const fileTree = await generateFileTree('./user');
    return res.json({ tree: fileTree })

})

app.get('/files/content', async (req, res) => {
    const path = req.query.path;
    console.log(req.query.path)
    const content = await fs.readFile(`./user/${path}`, 'utf-8')

    return res.json({ content })
})

const io = new SocketServer({
  cors: "*",
});
io.attach(server);

ptyProcess.onData((data) => {
  io.emit("terminal:data", data);
  console.log(data);
});

io.on("connection", (socket) => {
  console.log("socket connected with id " + socket.id);

  socket.on("terminal:write", (data) => {
    ptyProcess.write(data);
  });

  socket.on("file:change", async({path,content})=>{

    try {
        await fs.writeFile(`./user/${path}`,content)
    } catch (error) {
        console.log("error while writing files ")
    }

  })

  socket.on("disconnect", () => {
    console.log("socket disconnected with id " + socket.id);
  });
});

server.listen("9000", () => {
  console.log("🐳 docker is listen on port 9000");
});


async function generateFileTree(directory) {
    const tree = {}
    async function buildTree(currentDir, currentTree) {
        const files = await fs.readdir(currentDir)

        for (const file of files) {
            const filePath = path.join(currentDir, file)
            const stat = await fs.stat(filePath)

            if (stat.isDirectory()) {
                currentTree[file] = {}
                await buildTree(filePath, currentTree[file])
            } else {
                currentTree[file] = null
            }
        }
    }
    await buildTree(directory, tree);
    return tree
}