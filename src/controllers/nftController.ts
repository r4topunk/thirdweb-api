import { Request, Response } from 'express';
import { getNFTStatus } from '../services/nftService';

export const getNftHandler = async (req: Request, res: Response) => {
  try {
    const userAddress = req.query.userAddress as string || "";
    const contractAddress = req.query.contractAddress as string || "";
    const tokenId = BigInt(req.query.tokenId as string || "1");
    const chainId = Number(req.query.chainId) || 1;

    const nftStatus = await getNFTStatus({
      userAddress,
      contractAddress,
      tokenId,
      chainId,
    });

    return res.status(200).json(nftStatus);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
