import "dotenv/config";
import "express-async-errors";
import { ContractOptions, defineChain, getContract, sendTransaction } from "thirdweb";
import {
  claimTo,
  getClaimConditions,
  getNFT,
  getOwnedTokenIds,
} from "thirdweb/extensions/erc1155";
import { client, account } from "../utils/thirdweb";

/**
 * Interface para os parâmetros de entrada da função getNFTStatus
 */
interface GetNFTStatusParams {
  userAddress: string;
  contractAddress: string;
  tokenId: bigint;
  chainId: number;
}

type Contract = Readonly<ContractOptions<[]>>

/**
 * Obtém o contrato NFT
 */
function getNFTContract(params: { contractAddress: string; chainId: number }) {
  const { contractAddress, chainId } = params;
  return getContract({
    client,
    address: contractAddress,
    chain: defineChain(chainId),
  });
}

/**
 * Obtém os detalhes do NFT
 */
async function getNFTDetails(nftContract: Contract, tokenId: bigint) {
  return await getNFT({
    contract: nftContract,
    tokenId,
  });
}

/**
 * Obtém as condições de claim do NFT
 */
async function getNFTClaimConditions(nftContract: Contract, tokenId: bigint) {
  return await getClaimConditions({
    contract: nftContract,
    tokenId,
  });
}

/**
 * Verifica se o NFT foi mintado
 */
function isNFTMinted(nftDetails: any) {
  const isERC1155 = nftDetails.type === "ERC1155";
  return isERC1155 && nftDetails.supply > 0;
}

/**
 * Obtém os token IDs que o usuário possui
 */
async function getUserOwnedTokenIds(nftContract: Contract, userAddress: string) {
  return await getOwnedTokenIds({
    contract: nftContract,
    address: userAddress,
  });
}

/**
 * Verifica se o usuário é proprietário do produto
 */
function isUserOwner(
  userOwnedTokenIds: Array<{ tokenId: bigint }>,
  tokenId: bigint
) {
  return userOwnedTokenIds.some((token) => token.tokenId === tokenId);
}

/**
 * Realiza o claim do NFT
 */
async function claimNFT(
  nftContract: Contract,
  userAddress: string,
  tokenId: bigint
) {
  const claimTransaction = claimTo({
    contract: nftContract,
    to: userAddress,
    tokenId,
    quantity: 1n,
  });

  const transaction = await sendTransaction({
    transaction: claimTransaction,
    account,
  });
  return transaction.transactionHash;
}

/**
 * Extrai o valor de um atributo específico
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

/**
 * Lida com o claim do POAP
 */
async function handlePoapClaim(
  nftAttributes: any,
  userAddress: string,
  chainId: number,
  client: any,
) {
  if (nftAttributes) {
    const poapContractAddress = getAttributeValue(
      nftAttributes,
      "poap_contract"
    );
    const poapTokenIdValue = getAttributeValue(nftAttributes, "poap_token_id");

    if (poapContractAddress && poapTokenIdValue) {
      const poapTokenId = BigInt(poapTokenIdValue);

      const poapContract = getContract({
        client,
        address: poapContractAddress,
        chain: defineChain(chainId),
      });

      const poapClaimTransaction = claimTo({
        contract: poapContract,
        to: userAddress,
        tokenId: poapTokenId,
        quantity: 1n,
      });

      const poapTransaction = await sendTransaction({
        transaction: poapClaimTransaction,
        account,
      });
      return {
        isUserProductOwner: true,
        transactionHash: poapTransaction.transactionHash,
      };
    }
  }
  return { isUserProductOwner: false, transactionHash: null };
}

/**
 * Obtém o status de um NFT para um usuário específico.
 *
 * @param params - Parâmetros necessários para verificar o status do NFT
 * @returns Objeto contendo informações sobre o status do NFT
 */
export const getNFTStatus = async (params: GetNFTStatusParams) => {
  const { userAddress, contractAddress, tokenId, chainId } =
    params;

  // Inicialização das variáveis de status
  let nftStatus: "created" | "minted" = "minted";
  let isUserProductOwner = false;
  let isUserPoapOwner = false;
  let transactionHash: string | null = null;

  // Obtém o contrato do produto (NFT)
  const nftContract = getNFTContract({ contractAddress, chainId });

  // Obtém os detalhes do NFT
  const nftDetails = await getNFTDetails(nftContract, tokenId);

  // Obtém as condições de claim para o NFT
  const claimConditions = await getNFTClaimConditions(nftContract, tokenId);

  // Verifica se existem condições de claim
  if (claimConditions.length > 0) {
    if (isNFTMinted(nftDetails)) {
      nftStatus = "minted";

      // Obtém os IDs dos tokens que o usuário possui
      const userOwnedTokenIds = await getUserOwnedTokenIds(
        nftContract,
        userAddress
      );

      // Verifica se o usuário é proprietário do produto
      isUserProductOwner = isUserOwner(userOwnedTokenIds, tokenId);

      // Se o usuário não for proprietário, realiza o claim
      if (!isUserProductOwner) {
        transactionHash = await claimNFT(
          nftContract,
          userAddress,
          tokenId,
        );
        isUserPoapOwner = true;
      }
    } else {
      // Define o status como "created" já que o NFT não foi mintado
      nftStatus = "created";

      // Se o NFT não foi mintado, verifica se possui atributos específicos
      const nftAttributes = nftDetails.metadata.attributes;

      const poapResult = await handlePoapClaim(
        nftAttributes,
        userAddress,
        chainId,
        client,
      );
      isUserProductOwner = poapResult.isUserProductOwner;
      transactionHash = poapResult.transactionHash;
    }
  }

  // Retorna o status do NFT
  return {
    claimConditions,
    nftStatus,
    isUserProductOwner,
    isUserPoapOwner,
    transactionHash,
  };
};
