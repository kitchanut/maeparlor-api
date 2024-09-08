const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");

// Upload
const uploadMiddleware = require("../middleware/uploadMiddleware");

// Get all travel
router.get("/", async (req, res) => {
  const { type, status } = req.query;
  try {
    const travel = await prisma.travel.findMany({
      where: {
        ...(type && { type: type }),
        ...(status && { status: status }),
      },
      include: { Review: true },
    });
    res.json(travel);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching travel." });
  }
});

// Get a travel by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const travel = await prisma.travel.findUnique({
      where: { id: parseInt(id) },
      include: { Upload: true },
    });
    if (travel) {
      res.json(travel);
    } else {
      res.status(404).json({ error: "travel not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching the travel." });
  }
});

// Create a new travel
router.post("/", uploadMiddleware({}), async (req, res) => {
  const data = req.body;
  data.isOpenMonday = parseInt(data.isOpenMonday);
  data.isOpenTuesday = parseInt(data.isOpenTuesday);
  data.isOpenWednesday = parseInt(data.isOpenWednesday);
  data.isOpenThursday = parseInt(data.isOpenThursday);
  data.isOpenFriday = parseInt(data.isOpenFriday);
  data.isOpenSaturday = parseInt(data.isOpenSaturday);
  data.isOpenSunday = parseInt(data.isOpenSunday);
  delete data.location;
  const files = req.files;
  if (files.length) {
    data.image = files[0].path;
  }
  try {
    const new_travel = await prisma.travel.create({
      data,
    });
    res.status(201).json(new_travel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while creating the travel." });
  }
});

// Update a travel
router.post("/:id", uploadMiddleware({}), async (req, res) => {
  const { id } = req.params;

  const data = req.body;
  data.isOpenMonday = parseInt(data.isOpenMonday);
  data.isOpenTuesday = parseInt(data.isOpenTuesday);
  data.isOpenWednesday = parseInt(data.isOpenWednesday);
  data.isOpenThursday = parseInt(data.isOpenThursday);
  data.isOpenFriday = parseInt(data.isOpenFriday);
  data.isOpenSaturday = parseInt(data.isOpenSaturday);
  data.isOpenSunday = parseInt(data.isOpenSunday);
  delete data.location;

  const files = req.files;
  if (files.length) {
    data.image = files[0].path;
  }
  try {
    const updated_travel = await prisma.travel.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(updated_travel);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while updating the travel." });
  }
});

// Delete a travel
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const travel = await prisma.travel.findUnique({ where: { id: parseInt(id) } });
    if (travel.image) {
      fs.unlink(path.join(path.resolve(__dirname, ".."), travel.image), (err) => {
        err ? console.log(err) : "";
      });
    }
    await prisma.travel.delete({ where: { id: Number(id) } });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while deleting the travel." });
  }
});

module.exports = router;
