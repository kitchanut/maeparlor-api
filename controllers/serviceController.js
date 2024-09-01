const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");

// Upload
const uploadMiddleware = require("../middleware/uploadMiddleware");

// Get all Service
router.get("/", async (req, res) => {
  const { guideId } = req.query;
  try {
    const Service = await prisma.Service.findMany({
      where: {
        ...(guideId && { guideId: parseInt(guideId) }),
      },
    });
    res.json(Service);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching Service." });
  }
});

// Get a Service by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const Service = await prisma.Service.findUnique({ where: { id: parseInt(id) } });
    if (Service) {
      res.json(Service);
    } else {
      res.status(404).json({ error: "Service not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching the Service." });
  }
});

// Create a new Service
router.post("/", uploadMiddleware({}), async (req, res) => {
  const data = req.body;
  data.guideId ? (data.guideId = parseInt(data.guideId)) : null;
  data.providerId ? (data.providerId = parseInt(data.providerId)) : null;
  data.price = parseInt(data.price);
  delete data.location;
  const files = req.files;
  if (files.length) {
    data.image = files[0].path;
  }
  try {
    const new_Service = await prisma.Service.create({
      data,
    });
    res.status(201).json(new_Service);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while creating the Service." });
  }
});

// Update a Service
router.post("/:id", uploadMiddleware({}), async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const files = req.files;
  try {
    const updated_Service = await prisma.Service.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        status: data.status,
        ...(files.length && { image: files[0].path }),
      },
    });
    res.json(updated_Service);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while updating the Service." });
  }
});

// Delete a Service
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const Service = await prisma.Service.findUnique({ where: { id: parseInt(id) } });
    fs.unlink(path.join(path.resolve(__dirname, ".."), Service.image), async (err) => {
      err ? console.log(err) : "";
      await prisma.Service.delete({ where: { id: Number(id) } });
      res.status(200).end();
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while deleting the Service." });
  }
});

module.exports = router;
