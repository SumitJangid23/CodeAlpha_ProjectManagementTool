const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

 
  socket.emit("joinProject", "69c77991db661e4116aed82e");
});

socket.on("receiveMessage", (msg) => {
  console.log("🔥 New Message:", msg);
});

socket.on("connect_error", (err) => {
  console.log("❌ Connection Error:", err.message);
});