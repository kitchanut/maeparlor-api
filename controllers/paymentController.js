const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middleware/uploadMiddleware");
const path = require("path");
const fs = require("fs");

// Prisma Client
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/", uploadMiddleware({}), async (req, res) => {
  const files = req.files;
  const fileData = files.map((file, index) => ({
    cartId: parseInt(req.body.cartId),
    image: file.path,
  }));
  const createdFiles = await prisma.payment.createMany({
    data: fileData,
  });
  await prisma.cart.update({
    where: {
      id: parseInt(req.body.cartId),
    },
    data: {
      status: "pendingConfirmPayment",
    },
  });
  res.status(201).json({
    message: "Payment uploaded successfully",
  });
});

router.get("/", async (req, res) => {
  const { id, type } = req.query;
  try {
    const payment = await prisma.payment.findMany({
      where: {
        ...(type == "travel" && { travelId: parseInt(id) }),
        type: type,
      },
    });
    res.json(payment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching payment." });
  }
});

router.delete("/:id", async (req, res) => {
  const fileId = parseInt(req.params.id);

  try {
    const fileRecord = await prisma.payment.findUnique({
      where: { id: fileId },
    });

    if (!fileRecord) {
      return res.status(404).json({ message: "File not found" });
    }

    await prisma.cart.update({
      where: {
        id: parseInt(fileRecord.cartId),
      },
      data: {
        status: "pendingPayment",
      },
    });

    // Delete the file from the file system
    const projectRoot = path.resolve(__dirname, "..");
    fs.unlink(path.join(projectRoot, fileRecord.image), async (err) => {
      if (err) {
        console.log(err);
        // return res.status(500).json({ message: "Error deleting file from file system", error: err });
      }

      // Delete the record from the database
      await prisma.payment.delete({
        where: { id: fileId },
      });

      res.status(200).json({ message: "File deleted successfully" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting file", error: error.message });
  }
});

module.exports = router;
