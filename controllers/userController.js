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

// Get all User
router.get("/", async (req, res) => {
  try {
    const User = await prisma.User.findMany();
    res.json(User);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching User." });
  }
});

// Get a user by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.User.findUnique({
      where: { id: parseInt(id) },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching the user." });
  }
});

// Create a new user
router.post("/", async (req, res) => {
  let data = req.body;
  // const user = await await prisma.User.findUnique({
  //   where: {
  //     email: data.email,
  //   },
  // });
  // if (user) {
  //   return res.status(422).json({ message: "User already exists" });
  // } else {
  //   data.password = await bcrypt.hash(data.password, 10);
  //   const new_User = await prisma.User.create({
  //     data: data,
  //   });
  //   return res.status(201).json(new_User);
  // }
  try {
    data.password = await bcrypt.hash(data.password, 10);
    const new_User = await prisma.User.create({
      data: data,
    });
    return res.status(201).json(new_User);
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
    const updatedUser = await prisma.User.update({
      where: { id: parseInt(id) },
      data: data,
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while updating the user." });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.User.delete({ where: { id: parseInt(id) } });
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ error: "An error occurred while deleting the user." });
  }
});

module.exports = router;
