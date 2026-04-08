const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 5000;
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");

const app = express();


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://crest-app-rho.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
   origin: [
  "http://localhost:5173",
  "https://crest-app-rho.vercel.app"
],
    methods: ["GET", "POST"]
  },
});


app.set("io", io);


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/boards", require("./routes/boardRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

app.use("/api/workload", require("./routes/workloadRoutes"));
app.use("/api/health", require("./routes/healthRoutes"));
app.use("/api/risk", require("./routes/riskRoutes"));
app.use("/api/users", userRoutes);


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
    console.log("Joined project:", projectId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

   server.listen(PORT,"0.0.0.0" ,() => {
  console.log(`Server running on port ${PORT}`);
});
  })
  .catch((err) => console.log(err));