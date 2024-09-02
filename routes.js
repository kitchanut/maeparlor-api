const express = require("express");
const router = express.Router();

//Middleware
const authMiddleware = require("./middleware/authMiddleware");

// Controllers
const authController = require("./controllers/authController");
const uploadController = require("./controllers/uploadController");
const userController = require("./controllers/userController");
const guideController = require("./controllers/guideController");
const serviceController = require("./controllers/serviceController");
const cartController = require("./controllers/cartController");

// Login routes
router.use("/upload", uploadController);
router.use("/auth", authController);

// Authenticated routes
router.use("/users", userController);
router.use("/guides", guideController);
router.use("/services", serviceController);
router.use("/cart", cartController);

module.exports = router;
