const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");

// Upload
const uploadMiddleware = require("../middleware/uploadMiddleware");

// Get all service
router.get("/", async (req, res) => {
  const { guideId, status } = req.query;
  try {
    const service = await prisma.service.findMany({
      where: {
        ...(guideId && { guideId: parseInt(guideId) }),
        ...(status && { status: status }),
      },
      include: {
        guide: true,
        Review: true,
      },
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching service." });
  }
});

// Get a service by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.findUnique({ where: { id: parseInt(id) } });
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ error: "service not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching the service." });
  }
});

// Create a new service
router.post("/", uploadMiddleware({}), async (req, res) => {
  const data = req.body;
  data.guideId ? (data.guideId = parseInt(data.guideId)) : null;
  data.providerId ? (data.providerId = parseInt(data.providerId)) : null;
  data.price = parseInt(data.price);
  data.period = parseInt(data.period);
  data.specifyDate = parseInt(data.specifyDate);
  data.specifyTime = parseInt(data.specifyTime);
  delete data.location;
  const files = req.files;
  if (files.length) {
    data.image = files[0].path;
  }
  try {
    const new_service = await prisma.service.create({
      data,
    });
    res.status(201).json(new_service);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while creating the service." });
  }
});

// Update a service
router.post("/:id", uploadMiddleware({}), async (req, res) => {
  const { id } = req.params;

  const data = req.body;
  data.price = parseInt(data.price);
  data.period = parseInt(data.period);
  data.specifyDate = parseInt(data.specifyDate);
  data.specifyTime = parseInt(data.specifyTime);
  delete data.location;

  const files = req.files;
  if (files.length) {
    data.image = files[0].path;
  }
  try {
    const updated_service = await prisma.service.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(updated_service);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while updating the service." });
  }
});

// Delete a service
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.findUnique({ where: { id: parseInt(id) } });
    if (service.image) {
      fs.unlink(path.join(path.resolve(__dirname, ".."), service.image), (err) => {
        err ? console.log(err) : "";
      });
    }
    await prisma.service.delete({ where: { id: Number(id) } });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while deleting the service." });
  }
});

module.exports = router;
