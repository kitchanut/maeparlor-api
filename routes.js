const express = require("express");
const router = express.Router();

//Middleware
const authMiddleware = require("./middleware/authMiddleware");

// Controllers
const uploadController = require("./controllers/uploadController");
const userController = require("./controllers/userController");
const guideController = require("./controllers/guideController");
const serviceController = require("./controllers/serviceController");

// Login routes
router.use("/upload", uploadController);

// Authenticated routes
router.use("/users", userController);
router.use("/guides", guideController);
router.use("/services", serviceController);

module.exports = router;
