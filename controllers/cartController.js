const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all cart
router.get("/", async (req, res) => {
  const { userId, guideId, providerId, status } = req.query;
  try {
    const statusArray = status ? status.split(",") : [];
    const statusCondition = statusArray.length > 0 ? { status: { in: statusArray } } : {};

    const cart = await prisma.cart.findMany({
      where: {
        ...(userId && { userId: parseInt(userId) }),
        ...(guideId && { guideId: parseInt(guideId) }),
        ...(providerId && { providerId: parseInt(providerId) }),
        ...statusCondition,
      },
      include: {
        guide: true,
        provider: true,
        Service: true,
        User: true,
      },
    });
    res.json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching cart." });
  }
});

// Get a cart by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const cart = await prisma.cart.findUnique({ where: { id: parseInt(id) } });
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ error: "cart not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching the cart." });
  }
});

// Create a new cart
router.post("/", async (req, res) => {
  const data = req.body;
  try {
    data.date ? (data.date = new Date(data.date).toISOString()) : null;
    const new_cart = await prisma.cart.create({
      data: data,
    });
    res.status(201).json(new_cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while creating the cart." });
  }
});

// Update a cart
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    data.date ? (data.date = new Date(data.date).toISOString()) : null;
    const updated_cart = await prisma.cart.update({
      where: { id: parseInt(id) },
      data: data,
    });
    res.json(updated_cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while updating the cart." });
  }
});

// Delete a cart
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    await prisma.cart.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while deleting the cart." });
  }
});

module.exports = router;
