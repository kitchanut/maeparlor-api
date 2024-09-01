const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middleware/uploadMiddleware");
const path = require("path");
const fs = require("fs");

const multer = require("multer");
const sharp = require("sharp");
const upload = multer();

// Prisma Client
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/", uploadMiddleware({}), async (req, res) => {
  const files = req.files;
  const fileData = files.map((file, index) => ({
    order: index + 1,
    ...(req.body.car_id && { car_id: parseInt(req.body.car_id) }),
    ...(req.body.booking_id && { booking_id: parseInt(req.body.booking_id) }),
    type: req.body.type,
    file_name: Buffer.from(file.originalname, "latin1").toString("utf8"),
    extension: file.mimetype,
    size: file.size,
    file_path: file.path,
  }));
  const createdFiles = await prisma.uploads.createMany({
    data: fileData,
  });
  res.status(200).json({
    message: "Files uploaded successfully",
  });
});

router.get("/", async (req, res) => {
  // get parameter from query string
  const { id, type } = req.query;
  try {
    const uploads = await prisma.uploads.findMany({
      where: {
        ...(type == "car" && { car_id: parseInt(id) }),
        type: type,
      },
    });
    res.json(uploads);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching uploads." });
  }
});

router.delete("/:id", async (req, res) => {
  const fileId = parseInt(req.params.id);

  try {
    // Find the file in the database
    const fileRecord = await prisma.uploads.findUnique({
      where: { id: fileId },
    });

    if (!fileRecord) {
      return res.status(404).json({ message: "File not found" });
    }

    // Delete the file from the file system
    const projectRoot = path.resolve(__dirname, "..");
    fs.unlink(path.join(projectRoot, fileRecord.file_path), async (err) => {
      if (err) {
        console.log(err);
        // return res.status(500).json({ message: "Error deleting file from file system", error: err });
      }

      // Delete the record from the database
      await prisma.uploads.delete({
        where: { id: fileId },
      });

      res.status(200).json({ message: "File deleted successfully" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting file", error: error.message });
  }
});

module.exports = router;
