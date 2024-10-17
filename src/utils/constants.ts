import 'dotenv/config';
import { zoraSepolia } from 'thirdweb/chains';

export const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY ||  ""
export const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY ||  ""
export const CONTRACT_ADDRESS = "0xF3C3177058C3591D4931FF979F3900eEd816D7fe"
export const CHAIN = zoraSepolia

export const OP_TEST = {
  owner: "0x6ad1BB9DE62B004AEcdaB504F5C6Ec18f494D08d",
  user: "0x644C37f0700af375D7720E6c467a113247f596a2",
  chainId: 11155420,
  accountFactory: "0x714e2a84B72e4123f36E76a5fF727C959ec6aC80",
  modelContract: {
    address: "0x147dEBeA08871D0B5fc3CDA69e5F3320714693bb",
    tokenId: 2n
  },
  poapContract: {
    address: "0x0C88bc08DD1a331b9dB574e129EB9bF82676CB0e",
    tokenId: 0
  },
};