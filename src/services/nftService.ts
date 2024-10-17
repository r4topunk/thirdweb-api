import "dotenv/config";
import "express-async-errors";
import {
  ContractOptions,
  defineChain,
  getContract,
  sendTransaction,
} from "thirdweb";
import {
  claimTo,
  getClaimConditions,
  getNFT,
  getOwnedTokenIds,
} from "thirdweb/extensions/erc1155";
import { client, account } from "../utils/thirdweb";

/**
 * Interface for the input parameters of the getNFTStatus function
 */
interface GetNFTStatusParams {
  userAddress: string;
  contractAddress: string;
  tokenId: bigint;
  chainId: number;
}

type Contract = Readonly<ContractOptions<[]>>;

interface NftContractData {
  nftContract: Contract;
  nftDetails: any;
  claimConditions: any[];
  userOwnedTokenIds: { tokenId: bigint; balance: bigint }[];
  isUserOwner: boolean;
}

/**
 * Fetches all data related to an NFT contract: contract instance, details, claim conditions, and user-owned token IDs.
 */
async function getNFTContractData(
  contractAddress: string,
  chainId: number,
  tokenId: bigint,
  userAddress: string
): Promise<NftContractData> {
  const nftContract = getContract({
    client,
    address: contractAddress,
    chain: defineChain(chainId),
  });

  const [nftDetails, claimConditions, userOwnedTokenIds] = await Promise.all([
    getNFT({
      contract: nftContract,
      tokenId,
    }),
    getClaimConditions({
      contract: nftContract,
      tokenId,
    }),
    getOwnedTokenIds({
      contract: nftContract,
      address: userAddress,
    }),
  ]);

  const isUserOwner = userOwnedTokenIds.some(
    (token) => token.tokenId === tokenId
  );

  return { nftContract, nftDetails, claimConditions, userOwnedTokenIds, isUserOwner };
}

/**
 * Fetches all necessary data for the NFT, including contract, details, claim conditions, and user ownership.
 *
 * @param userAddress - Address of the user
 * @param contractAddress - NFT contract address
 * @param tokenId - Token ID of the NFT
 * @param chainId - Chain ID where the contract is deployed
 * @returns An object with all fetched NFT data
 */
export const fetchNftData = async (
  userAddress: string,
  contractAddress: string,
  tokenId: bigint,
  chainId: number
): Promise<NftContractData> => {
  return getNFTContractData(contractAddress, chainId, tokenId, userAddress);
};

/**
 * Retrieves the status of an NFT for a specific user.
 *
 * @param params - Parameters needed to check the NFT status
 * @returns An object containing information about the NFT status
 */
export const getNFTStatus = async (params: GetNFTStatusParams) => {
  const { userAddress, contractAddress, tokenId, chainId } = params;

  // Fetch the main contract data
  const mainContractData = await fetchNftData(
    userAddress,
    contractAddress,
    tokenId,
    chainId
  );

  // Check if the NFT has POAP attributes (to determine if there's a secondary contract)
  const nftAttributes = mainContractData.nftDetails.metadata.attributes;
  const poapContractAddress = nftAttributes
    ? getAttributeValue(nftAttributes, "poap_contract")
    : null;
  const poapTokenIdValue = nftAttributes
    ? getAttributeValue(nftAttributes, "poap_token_id")
    : null;

  let poapContractData: NftContractData | null = null;

  // If POAP contract exists, fetch its data
  if (poapContractAddress && poapTokenIdValue) {
    const poapTokenId = BigInt(poapTokenIdValue);
    poapContractData = await fetchNftData(
      userAddress,
      poapContractAddress,
      poapTokenId,
      chainId
    );
  }

  // Return full data for both the main contract and the POAP contract
  return {
    mainContract: {
      nftDetails: mainContractData.nftDetails,
      claimConditions: mainContractData.claimConditions,
      userOwnedTokenIds: mainContractData.userOwnedTokenIds,
      isUserOwner: mainContractData.isUserOwner,
      transactionHash: null, // Add this if needed
    },
    poapContract: poapContractData
      ? {
          nftDetails: poapContractData.nftDetails,
          claimConditions: poapContractData.claimConditions,
          userOwnedTokenIds: poapContractData.userOwnedTokenIds,
          isUserOwner: poapContractData.isUserOwner,
          transactionHash: null, // Add this if needed
        }
      : null,
  };
};

/**
 * Extracts the value of a specific attribute
 */
function getAttributeValue(attributes: any, traitType: string) {
  if (Array.isArray(attributes)) {
    const attribute = attributes.find(
      (attr: any) => attr.trait_type === traitType
    );
    return attribute ? attribute.value : null;
  } else if (typeof attributes === "object" && attributes !== null) {
    return attributes[traitType];
  }
  return null;
}
