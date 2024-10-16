import { createThirdwebClient } from "thirdweb";
import { THIRDWEB_SECRET_KEY, WALLET_PRIVATE_KEY } from "./constants";
import { privateKeyToAccount } from "thirdweb/wallets";

export const client = createThirdwebClient({
  secretKey: THIRDWEB_SECRET_KEY,
});

export const account = privateKeyToAccount({
  client,
  privateKey: WALLET_PRIVATE_KEY,
});