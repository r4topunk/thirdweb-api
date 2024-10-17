import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { getNFT } from "thirdweb/extensions/erc721";
import { OP_TEST } from "../utils/constants";
import { client } from "../utils/thirdweb";
import { transfer } from "thirdweb/extensions/farcaster/idRegistry";
import { NFTContractHandler } from "./erc721";
import { nextTokenIdToMint } from "thirdweb/extensions/erc1155";

const TEST_WALLET = "0xC1460636c95DBE88FC3FF9bdAC9Af76720089861";
const R4TO_WALLET = "0xC68b71B6Bf78E4BE2A0229345A2C3EeBB032247F";

(async () => {
  const userAddress = OP_TEST.user;
  const contractAddress = OP_TEST.modelContract.address;
  // const tokenId = BigInt(OP_TEST.modelContract.tokenId);
  const chainId = OP_TEST.chainId;

  // const nftStatus = await getNFTStatus({
  //   userAddress,
  //   contractAddress,
  //   tokenId,
  //   chainId,
  // });

  // console.dir(nftStatus, { depth: null, colors: true });

  const nftHandler = new NFTContractHandler(contractAddress, chainId);

  const nextToken = await nftHandler.nextTokenIdToMint();
  console.log({nextToken})

  const mintResult = await nftHandler.lazyMint([
    {
      name: "cadeira do chef",
      image: "ipfs://QmZBGxo832QD4cbynCRHdmH3QLKSZJ6RGK3F6or9eUqHYJ/2.png",
      properties: {
        poap_contract: OP_TEST.poapContract.address,
        poap_token_id: OP_TEST.poapContract.tokenId,
      },
    },
  ]);

  console.log({mintResult});

  const tokenId = nextToken
  
  const claimResult = await nftHandler.claimTo(OP_TEST.owner, 1n);
  console.log(claimResult);

  const transferResult = await nftHandler.transferFrom(
    tokenId,
    OP_TEST.owner,
    OP_TEST.user
  );
  console.log({ transferResult });

  const nft = await nftHandler.getNft(tokenId);
  console.log({ nft });
})();
