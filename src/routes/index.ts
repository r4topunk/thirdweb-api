import "dotenv/config";
import express from "express";
import "express-async-errors";
import httpStatus from "http-status";
import { getNftHandler } from "../controllers/nftController";

const router = express.Router();

/**
 * Root path
 */
router.get("/", (_, res) => {
  res.status(httpStatus.OK).json({
    message: "hack the planet",
  });
});

router.get("/nft", getNftHandler);

export default router;
