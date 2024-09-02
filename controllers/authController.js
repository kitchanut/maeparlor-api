const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

// Prisma Client
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  omit: {
    user: {
      password: true,
    },
  },
});

router.post("/check_user", async (req, res) => {
  try {
    const data = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email: data.userId,
      },
    });
    if (user) {
      const updateduser = await prisma.user.update({
        where: { id: parseInt(user.id) },
        data: {
          ...(data.level && { level: data.level }),
          lineUserId: data.userId,
          lineDisplayName: data.displayName,
          linePictureUrl: data.pictureUrl,
        },
      });
      return res.status(200).json(updateduser);
    } else {
      let password = await bcrypt.hash("1234", 10);
      const new_user = await prisma.user.create({
        data: {
          email: data.userId,
          name: data.displayName,
          password: password,
          level: "ผู้ใช้งานทั่วไป",
          lineUserId: data.userId,
          lineDisplayName: data.displayName,
          linePictureUrl: data.pictureUrl,
          status: "เปิดใช้งาน",
        },
      });
      return res.status(200).json(new_user);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
