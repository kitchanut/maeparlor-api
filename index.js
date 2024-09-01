const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", async (req, res) => {
  res.json({
    message: "Welcome to the Maeparlor API",
  });
});

const routes = require("./routes");
app.use("/api", routes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
