require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/key");
const server = require('http').createServer();
const mongoose = require("mongoose");
const socketFunctions = require('./utils/socketFunctions');
const helmet = require('helmet');
const router = require('./routes/movieRoute')
let userslist = [];
const connect = mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,  useFindAndModify: false })
  .then(() => console.log('\033[92m', '>>>> MongoDB Connected!'))
  .catch(err => console.log(err));
  app.use(helmet());
  const io = require('socket.io')(server, {
    path: '/',
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: true
});
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api', router(userslist))
app.use('/api/oauth', require('./routes/oauth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/comment', require('./routes/comment'));
app.use('/api/like', require('./routes/like'));
app.use('/api/favorite', require('./routes/favorite'));
app.use('/api/addWatch', require('./routes/addWatch'));

//use this to show the image you have in node js server to client (react js)
//https://stackoverflow.com/questions/48914987/send-image-path-from-node-js-express-server-to-react-client
app.use('/uploads', express.static('uploads'));

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {

  // Set static folder
  app.use(express.static("client/build"));

  // index.html for all page routes
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// Error messages
// app.get('*', function(req, res) {
//   res.status(404).send('You are in the wrong place ;)');
// })
// Sockets

io.sockets.on('connection', async(socket) => {
  console.log()
    if (socket.handshake.headers.cookie) {
        userslist = await socketFunctions.pushUserSocket(socket, userslist, '');
        socket.on('stream:play', async (movieID) => {
            userslist = await socketFunctions.pushUserSocket(socket, userslist, movieID);
        });
        socket.on('stream:unmount', async () => {
            userslist = await socketFunctions.deleteUserSocket(socket, userslist);
        });
        socket.on('disconnect', async () => {
            userslist = await socketFunctions.deleteUserSocket(socket, userslist);
        });
    }
});
app.use('/api/subtitles', express.static('files/subtitles'));
const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log('\033[95m', `> Server Running at ${port}`)
});
server.listen(process.env.SOCKET_PORT, () => console.log('\033[95m', `>> Server socket has started on port ${process.env.SOCKET_PORT}`));