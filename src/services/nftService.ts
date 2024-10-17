import "dotenv/config";
import "express-async-errors";
import { ContractOptions, defineChain, getContract } from "thirdweb";
import {
  isERC1155,
  getClaimConditions as getClaimConditions1155,
  getNFT as getNFT1155,
  getOwnedTokenIds as getOwnedTokenIds1155,
} from "thirdweb/extensions/erc1155";
import {
  isERC721,
  getClaimConditions as getClaimConditions721,
  getNFT as getNFT721,
  getOwnedTokenIds as getOwnedTokenIds721,
} from "thirdweb/extensions/erc721";
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

  // Determine the contract type (ERC721 or ERC1155)
  const is1155 = await isERC1155({ contract: nftContract });
  const is721 = await isERC721({ contract: nftContract });

  if (!is1155 && !is721) {
    throw new Error("Contract is neither ERC1155 nor ERC721");
  }

  let nftDetails, claimConditions, userOwnedTokenIds;

  // Fetch data based on contract type
  if (is1155) {
    [nftDetails, claimConditions, userOwnedTokenIds] = await Promise.all([
      getNFT1155({
        contract: nftContract,
        tokenId,
      }),
      getClaimConditions1155({
        contract: nftContract,
        tokenId,
      }),
      getOwnedTokenIds1155({
        contract: nftContract,
        address: userAddress,
      }),
    ]);
  } else if (is721) {
    [nftDetails, claimConditions, userOwnedTokenIds] = await Promise.all([
      getNFT721({
        contract: nftContract,
        tokenId,
      }),
      getClaimConditions721({
        contract: nftContract,
      }),
      getOwnedTokenIds721({
        contract: nftContract,
        owner: userAddress
      }),
    ]);
  }

  const isUserOwner = userOwnedTokenIds.some(
    (token) => token.tokenId === tokenId
  );

  return {
    nftContract,
    nftDetails,
    claimConditions,
    userOwnedTokenIds,
    isUserOwner,
  };
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
