const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  omit: {
    user: {
      password: true,
    },
  },
});

// Get all user
router.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findMany();
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching user." });
  }
});

// Get a user by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "user not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching the user." });
  }
});

// Create a new user
router.post("/", async (req, res) => {
  let data = req.body;
  // const user = await await prisma.user.findUnique({
  //   where: {
  //     email: data.email,
  //   },
  // });
  // if (user) {
  //   return res.status(422).json({ message: "user already exists" });
  // } else {
  //   data.password = await bcrypt.hash(data.password, 10);
  //   const new_user = await prisma.user.create({
  //     data: data,
  //   });
  //   return res.status(201).json(new_user);
  // }
  try {
    data.password = await bcrypt.hash(data.password, 10);
    const new_user = await prisma.user.create({
      data: data,
    });
    return res.status(201).json(new_user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "An error occurred while creating the user." });
  }
});

// Update a user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  let data = req.body;
  try {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const updateduser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: data,
    });
    res.json(updateduser);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while updating the user." });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ error: "An error occurred while deleting the user." });
  }
});

module.exports = router;
