import { createThirdwebClient } from "thirdweb";
import { THIRDWEB_SECRET_KEY } from "./constants";

export const client = createThirdwebClient({
  secretKey: THIRDWEB_SECRET_KEY,
});
