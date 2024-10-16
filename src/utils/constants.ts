import 'dotenv/config';
import { zoraSepolia } from 'thirdweb/chains';

export const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY ||  ""
export const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY ||  ""
export const CONTRACT_ADDRESS = "0xF3C3177058C3591D4931FF979F3900eEd816D7fe"
export const CHAIN = zoraSepolia

