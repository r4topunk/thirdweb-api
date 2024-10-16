import "dotenv/config";
import express from "express";
import "express-async-errors";
import httpStatus from "http-status";
import { defineChain, getContract, sendTransaction } from "thirdweb";
import {
  claimTo,
  getClaimConditions,
  getNFT,
  getOwnedTokenIds,
} from "thirdweb/extensions/erc1155";
import { account, client } from "../utils/thirdweb";

const router = express.Router();

/**
 * Root path
 */
router.get("/", (_, res) => {
  res.status(httpStatus.OK).json({
    message: "hack the planet",
  });
});

router.get("/nft", async (_, res) => {
  // Recebe contract address, token id, wallet address?
  const userAddr = "";
  const contractAddr = "";
  const tokenId = 1n;
  const chainId = 1;

  let nftStatus: "created" | "minted" = "minted";
  let isProductOwner = false;
  let isPoapOwner = false;
  let txHash : string | null = null;

  const productContract = getContract({
    client,
    address: contractAddr,
    chain: defineChain(chainId),
  });

  const nft = await getNFT({
    contract: productContract,
    tokenId,
  });

  const claimConditions = await getClaimConditions({
    contract: productContract,
    tokenId,
  });

  if (claimConditions.length > 0) {
    const is1155 = nft.type === "ERC1155";
    const isMinted = is1155 && nft.supply > 0;

    if (isMinted) {
      nftStatus = "minted"

      const ownedTokenIds = await getOwnedTokenIds({
        contract: productContract,
        address: userAddr,
      });

      isProductOwner = ownedTokenIds.some(
        (product) => product.tokenId == tokenId
      );

      if (!isProductOwner) {
        const transaction = claimTo({
          contract: productContract,
          to: userAddr,
          tokenId,
          quantity: 1n,
        });

        const tx = await sendTransaction({ transaction, account });
        txHash = tx.transactionHash

        isPoapOwner = true
      }
    } else {
      // Se não foi mintado
      const attributes = nft.metadata.attributes

      if (attributes && Object.keys(attributes).includes("poap_contract")) {
        const poapContractAddress = attributes['poap_contract'] as string
        const poapTokenId = attributes['poap_token_id'] as bigint
        
        const poapContract = getContract({
          client,
          address:  poapContractAddress,
          chain: defineChain(chainId),
        });

        const transaction = claimTo({
          contract: poapContract,
          to: userAddr,
          tokenId: poapTokenId,
          quantity: 1n,
        });
  
        const tx = await sendTransaction({ transaction, account });
        isProductOwner = true
        txHash = tx.transactionHash
      }
    }
  }

  return res.status(httpStatus.OK).json({
    claimConditions,
    nftStatus,
    isProductOwner,
    isPoapOwner,
    txHash
  });
});

export default router;
