import { zoraSepolia } from "thirdweb/chains";
import { getNFTStatus } from "../services/nftService";
import { CONTRACT_ADDRESS } from "../utils/constants";

const TEST_WALLET = "0xC1460636c95DBE88FC3FF9bdAC9Af76720089861";
const R4TO_WALLET = "0xC68b71B6Bf78E4BE2A0229345A2C3EeBB032247F";


(async () => {
  const userAddress = TEST_WALLET
  const contractAddress = CONTRACT_ADDRESS
  const tokenId = 9n
  const chainId = zoraSepolia.id

  const nftStatus = await getNFTStatus({
    userAddress,
    contractAddress,
    tokenId,
    chainId,
  });

  console.dir(nftStatus, {depth: null, colors: true})
})() ;