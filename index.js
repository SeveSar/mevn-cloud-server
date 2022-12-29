require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes");
const fileRouter = require("./routes/file.routes");
const usersRouter = require("./routes/users.routes");
const fileUpload = require("express-fileupload");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const errorMiddleware = require("./middleware/error.middleware");
const filePathMiddleware = require("./middleware/filePath.middleware");
// const corsMiddleware = require("./middleware/cors.middleware");

const whitelist = [
  "http://localhost:5173",
  "http://localhost:4173",
  "*",
  "192.168.56.1",
];
const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cookieParser());
app.use(fileUpload({}));
app.use(cors(corsOptions));
app.use(filePathMiddleware(path.resolve(__dirname, "files")));

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
console.log(__filename, "filename");
app.use("/api/auth", authRouter);
app.use("/api/files", fileRouter);
app.use("/users", usersRouter);
// errorMiddleware всегда вконце всех цепочек миддлеваров

app.use(errorMiddleware);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);

    app.listen(PORT, () => {
      console.log(`STARTED on ${PORT} PORT`);
    });
  } catch (e) {
    console.log(e);
  }
};
start();
