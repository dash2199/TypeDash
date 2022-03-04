const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");

app.use(cors());

const server = http.Server(app);

const PORT = process.env.PORT || 3001;

app.use( express.static(__dirname + '/../../build'));

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
})


const mp = new Map();
const info = new Map();

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("words" , (data) =>{
        io.to(data.id).emit("words" , data.words);
    })

    socket.on("start_info" , (data) =>{
        io.to(data.id).emit("start_info" , {c : data.c , flag: data.flag});
    })

    socket.on("timer" , (data) =>{
        io.to(data.id).emit("timer" , data.time);
    })  

    socket.on("result" , (data) =>{
        info.set(socket.id , data);
        var se = io.sockets.adapter.rooms.get(data.id);
        let users = [];
        se.forEach((val) => {
            users.push(info.get(val));
        })
        console.log(info);
        io.to(data.id).emit("result" , users);
    })

    socket.on("rest" , (data) =>{
        io.to(data.id).emit("rest" , data.fl);
    })

    socket.on("join_room", (data) => {
        socket.join(data.id);
        console.log(`User joined room: ${data.id}`);
        
        var se = io.sockets.adapter.rooms.get(data.id);
        var cnt = io.sockets.adapter.rooms.get(data.id).size;
        console.log(cnt);
        io.to(data.id).emit("get_cnt" , cnt);
        mp.set(socket.id , data.name);

        let users = [];

        se.forEach((val) => {
            users.push(mp.get(val));
        })
        console.log();
        io.to(data.id).emit("new_users" , users);
        
    })

    socket.on("disconnect", () =>{
        console.log("User Disconnected", socket.id);
        mp.delete(socket.id);
    })
})

server.listen(PORT, () => {
    console.log("SERVER RUNNING" + PORT);
});

