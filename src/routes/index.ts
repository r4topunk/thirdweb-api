import express from "express";
import "express-async-errors";
import httpStatus from "http-status";
import "dotenv/config";

const router = express.Router();

/**
 * Root path
 */
router.get("/", (_, res) => {
  res.status(httpStatus.OK).json({
    message: "hack the planet",
  });
});

export default router;
