import { getContract, sendTransaction } from "thirdweb";
import {
  burn,
  claimTo,
  getActiveClaimCondition,
  getClaimConditions,
  getOwnedNFTs,
  getOwnedTokenIds,
  isBurnSupported,
  isClaimToSupported,
} from "thirdweb/extensions/erc1155";
import {
  CHAIN,
  CONTRACT_ADDRESS,
  WALLET_PRIVATE_KEY,
} from "../utils/constants";
import { getWalletBalance, privateKeyToAccount } from "thirdweb/wallets";
import { client } from "../utils/thirdweb";

// 2. get the contract
const contract = getContract({
  client,
  address: CONTRACT_ADDRESS,
  chain: CHAIN,
});

const account = privateKeyToAccount({
  client,
  privateKey: WALLET_PRIVATE_KEY,
});
const address = account.address;

const TEST_WALLET = "0xC1460636c95DBE88FC3FF9bdAC9Af76720089861";
const R4TO_WALLET = "0xC68b71B6Bf78E4BE2A0229345A2C3EeBB032247F";

async function logOwnedNFTs() {
  // 3. call the extension function
  const ownedNFTs = await getOwnedNFTs({
    contract,
    address: R4TO_WALLET,
  });

  console.log(ownedNFTs);
}

async function logCreateAccount() {
  console.log("Connected as", address);
}

async function logWalletData() {
  // Get the balance of the account
  const balance = await getWalletBalance({
    address,
    chain: CHAIN,
    client,
  });
  console.log("Balance:", balance.displayValue, balance.symbol);
}

async function burnNft() {
  const transaction = burn({
    contract,
    account: TEST_WALLET,
    id: 0n,
    value: 1n,
  });

  // Send the transaction
  try {
    const res = await sendTransaction({ transaction, account });
    console.log(res);
  } catch (err) {
    console.error(err);
  }
}

(async () => {
  const tokenId = 9n;
  
  // console.log("teste")
  // const conditions = await getClaimConditions({
  //   contract,
  //   tokenId,
  // });
  // console.log(conditions)
  // const activeClaimCondition = await getActiveClaimCondition({
  //   contract,
  //   tokenId,
  // });
  // console.log(activeClaimCondition)

  const transaction = claimTo({
    contract,
    to: R4TO_WALLET,
    tokenId,
    quantity: 1n,
  });
   
  // const tx = await sendTransaction({ transaction, account });
  // console.log(tx)

  // logOwnedNFTs();

  const ownedTokenIds = await getOwnedTokenIds({
    contract,
    address: R4TO_WALLET,
  });
  console.log(ownedTokenIds)
})();
