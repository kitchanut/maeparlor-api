const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all review
router.get("/", async (req, res) => {
  const { userId, guideId, serviceId, travelId } = req.query;
  try {
    const review = await prisma.review.findMany({
      where: {
        ...(userId && { userId: parseInt(userId) }),
        ...(guideId && { guideId: parseInt(guideId) }),
        ...(serviceId && { serviceId: parseInt(serviceId) }),
        ...(travelId && { travelId: parseInt(travelId) }),
      },
      include: {
        user: true,
        Service: true,
      },
    });
    res.json(review);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching review." });
  }
});

// Get a review by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const review = await prisma.review.findUnique({ where: { id: parseInt(id) } });
    if (review) {
      res.json(review);
    } else {
      res.status(404).json({ error: "review not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching the review." });
  }
});

// Create a new review
router.post("/", async (req, res) => {
  const data = req.body;
  try {
    const new_review = await prisma.review.create({
      data,
    });
    res.status(201).json(new_review);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while creating the review." });
  }
});

// Update a review
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updated_review = await prisma.review.update({
      where: { id: parseInt(id) },
      data: data,
    });
    res.json(updated_review);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while updating the review." });
  }
});

// Delete a review
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    await prisma.review.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while deleting the review." });
  }
});

router.get("/check/:userId", async (req, res) => {
  const { userId } = req.params;
  const { guideId, serviceId, travelId } = req.query;
  try {
    const review = await prisma.review.findFirst({
      where: {
        userId: parseInt(userId),
        ...(guideId && { guideId: parseInt(guideId) }),
        ...(serviceId && { serviceId: parseInt(serviceId) }),
        ...(travelId && { travelId: parseInt(travelId) }),
      },
    });
    if (review) {
      res.json(review);
    } else {
      res.status(404).json({ error: "review not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while updating the review." });
  }
});

module.exports = router;
