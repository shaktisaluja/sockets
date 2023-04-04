const express = require("express");
const app = express();
const passport = require("passport");
const http = require("http").Server(app);
const mongoose = require("mongoose");
const chalk = require("chalk");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { port, hostIP } = require("./config/keys").host;
const bodyParser = require("body-parser");
const io = require("socket.io")(http, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3000/",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3000/",
      "http://192.168.0.123:3000",
      "https://test.khushbir.info",
      "https://www.myfanstime.com/",
      "https://www.myfanstime.com",
      "https://myfanstime.com",
      "https://myfanstime.com/",
      "https://fanstime-web.vercel.app",
      "https://memesake-react-app.vercel.app/",
      "https://memesake-react-app.vercel.app",
    ],
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

const routes = require("./routes");
require("./services/passport");
app.use(passport.initialize());
const socketMessaging = require("./socket/messaging");

const { database } = require("./config/keys");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(express.json({ limit: "50mb", extended: true }));

app.use(express.urlencoded({ limit: "50mb", extended: true }));
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3000/",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3000/",
    "http://192.168.0.123:3000",
    "https://test.khushbir.info",
    "https://www.myfanstime.com/",
    "https://www.myfanstime.com",
    "https://myfanstime.com",
    "https://myfanstime.com/",
    "https://fanstime-web.vercel.app",
    "https://memesake-react-app.vercel.app/",
    "https://memesake-react-app.vercel.app",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(morgan("combined"));

app.use(routes);

// app.use(passport.initialize());
// app.use(passport.session());

// Connect to MongoDB

mongoose
  .connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    console.log(`${chalk.green("✓")} ${chalk.blue("MongoDB Connected!")}`)
  )
  .then(() => {
    http.listen(port, hostIP, () => {
      console.log(
        `${chalk.green("✓")} ${chalk.blue(
          "Server Started on port"
        )} http://${chalk.bgMagenta.white(hostIP)}:${chalk.bgMagenta.white(
          port
        )}`
      );
    });
    socketMessaging(io);
  })
  .catch((err) => console.log(err));
