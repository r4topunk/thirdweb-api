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

router.get("/nft", (_, res) => {
  // Verifica se o NFT tem claim condition ativo
  // Retorna caso não

  // Verifica se o NFT já foi mintado
  
  // Verifica se a Wallet é owner de um token
  // Retorna caso sim

  // Minta NFT para a Wallet
  // Caso não tenha mintagem, deve mintar um NFT de dono do token
  // Caso tenha mintagem, deve buscar nos metadados o contrato de POAP

  // Retorna informações do processo

  res.status(httpStatus.OK).json({
    message: "hack the planet",
  });
});

export default router;
