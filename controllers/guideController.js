const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Upload
const uploadMiddleware = require("../middleware/uploadMiddleware");

// Get all Guide
router.get("/", async (req, res) => {
  try {
    const Guide = await prisma.Guide.findMany();
    res.json(Guide);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching Guide." });
  }
});

// Get a Guide by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const Guide = await prisma.Guide.findUnique({ where: { id: parseInt(id) } });
    if (Guide) {
      res.json(Guide);
    } else {
      res.status(404).json({ error: "Guide not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching the Guide." });
  }
});

// Create a new Guide
router.post("/", uploadMiddleware({}), async (req, res) => {
  const data = req.body;
  const files = req.files;
  try {
    const new_Guide = await prisma.Guide.create({
      data: {
        name: data.name,
        status: data.status,
        ...(files.length && { image: files[0].path }),
      },
    });
    res.status(201).json(new_Guide);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while creating the Guide." });
  }
});

// Update a Guide
router.post("/:id", uploadMiddleware({}), async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const files = req.files;
  try {
    const updated_Guide = await prisma.Guide.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        status: data.status,
        ...(files.length && { image: files[0].path }),
      },
    });
    res.json(updated_Guide);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while updating the Guide." });
  }
});

// Delete a Guide
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    await prisma.Guide.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while deleting the Guide." });
  }
});

module.exports = router;
