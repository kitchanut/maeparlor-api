const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Upload
const uploadMiddleware = require("../middleware/uploadMiddleware");

// Get all guide
router.get("/", async (req, res) => {
  try {
    const guide = await prisma.guide.findMany();
    res.json(guide);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching guide." });
  }
});

// Get a guide by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const guide = await prisma.guide.findUnique({ where: { id: parseInt(id) } });
    if (guide) {
      res.json(guide);
    } else {
      res.status(404).json({ error: "guide not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching the guide." });
  }
});

// Create a new guide
router.post("/", uploadMiddleware({}), async (req, res) => {
  const data = req.body;
  const files = req.files;
  try {
    const new_guide = await prisma.guide.create({
      data: {
        name: data.name,
        status: data.status,
        ...(files.length && { image: files[0].path }),
      },
    });
    res.status(201).json(new_guide);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while creating the guide." });
  }
});

// Update a guide
router.post("/:id", uploadMiddleware({}), async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const files = req.files;
  try {
    const updated_guide = await prisma.guide.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        status: data.status,
        ...(files.length && { image: files[0].path }),
      },
    });
    res.json(updated_guide);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while updating the guide." });
  }
});

// Delete a guide
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    await prisma.guide.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while deleting the guide." });
  }
});

module.exports = router;
