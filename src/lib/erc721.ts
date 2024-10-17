import {
  defineChain,
  getContract,
  prepareContractCall,
  sendTransaction,
  waitForReceipt,
} from "thirdweb";
import { client, account } from "../utils/thirdweb";
import { claimTo, getNFT, lazyMint, mintTo, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { NFTInput } from "thirdweb/utils";

export class NFTContractHandler {
  private contract: string;
  private chainId: number;

  constructor(contract: string, chainId: number) {
    this.contract = contract;
    this.chainId = chainId;
  }

  private getContractInstance() {
    return getContract({
      client,
      address: this.contract,
      chain: defineChain(this.chainId),
    });
  }

  // Função genérica para lidar com transações e recebimento de receipt
  private async executeTransaction(transaction: any) {
    const { transactionHash } = await sendTransaction({
      transaction,
      account,
    });

    const receipt = await waitForReceipt({
      client,
      chain: defineChain(this.chainId),
      transactionHash: transactionHash,
    });

    return receipt;
  }

  public async transferFrom(tokenId: bigint, from: string, to: string) {
    const contract = this.getContractInstance();

    const transaction = prepareContractCall({
      contract,
      method:
        "function transferFrom(address from, address to, uint256 tokenId) payable",
      params: [from, to, BigInt(tokenId)],
    });

    return this.executeTransaction(transaction);
  }

  public async mintTo(to: string, nft: NFTInput) {
    const contract = this.getContractInstance();

    const transaction = mintTo({
      contract,
      to,
      nft,
    });

    return this.executeTransaction(transaction);
  }

  public async lazyMint(nfts: NFTInput[]) {
    const contract = this.getContractInstance();

    const transaction = lazyMint({
      contract,
      nfts,
    });

    return this.executeTransaction(transaction);
  }

  public async claimTo(to: string, quantity: bigint) {
    const contract = this.getContractInstance();

    const transaction = claimTo({
      contract,
      to,
      quantity,
    });

    return this.executeTransaction(transaction);
  }

  public async getNft(tokenId: bigint, includeOwner: boolean = true) {
    const contract = this.getContractInstance();
    return await getNFT({ contract, tokenId, includeOwner: true });
  }

  public async nextTokenIdToMint() {
    const contract = this.getContractInstance();
    
    return await nextTokenIdToMint({
      contract,
    });
  }
}
