const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middleware/uploadMiddleware");
const path = require("path");
const fs = require("fs");

// Prisma Client
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/", uploadMiddleware({}), async (req, res) => {
  const files = req.files;
  const fileData = files.map((file, index) => ({
    ...(req.body.travelId && { travelId: parseInt(req.body.travelId) }),
    type: req.body.type,
    file_name: Buffer.from(file.originalname, "latin1").toString("utf8"),
    extension: file.mimetype,
    size: file.size,
    file_path: file.path,
  }));
  const createdFiles = await prisma.upload.createMany({
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
    const upload = await prisma.upload.findMany({
      where: {
        ...(type == "travel" && { travelId: parseInt(id) }),
        type: type,
      },
    });
    res.json(upload);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching upload." });
  }
});

router.delete("/:id", async (req, res) => {
  const fileId = parseInt(req.params.id);

  try {
    // Find the file in the database
    const fileRecord = await prisma.upload.findUnique({
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
      await prisma.upload.delete({
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
