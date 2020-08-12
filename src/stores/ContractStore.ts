import { action, observable } from "mobx";
import { AbiItem } from "web3-utils";
import { parseAbiJson } from "../util/abi";
import { toChecksumAddress } from "../util/address";
import { Store } from "./Store";

export interface Contract {
  address: string;
  name: string;
  abi: AbiItem[];
}

export interface ContractData {
  address: string;
  name: string;
  abi: string;
}

export class ContractStore extends Store<ContractData[]> {
  public static readonly storageKey = "ContractStore";

  @observable
  private contracts = new Map<string, Contract>();

  protected marshal(): ContractData[] {
    return this.allContracts().map((contract) => ({
      ...contract,
      abi: JSON.stringify(contract.abi),
    }));
  }

  @action
  protected unmarshal(data: ContractData[]): void {
    for (const contract of data) {
      this.addContract(contract);
    }
  }

  /**
   * Add a contract to the store
   * @param data Contract data
   * @returns Added contract
   */
  @action
  public addContract(data: ContractData): Contract {
    const contract: Contract = {
      name: data.name.trim(),
      address: toChecksumAddress(data.address),
      abi: parseAbiJson(data.abi),
    };
    this.contracts.set(data.address.toLowerCase(), contract);
    return contract;
  }

  /**
   * Return all contracts in the store
   * @returns An array of Contract objects
   */
  public allContracts(): Contract[] {
    return Array.from(this.contracts.values());
  }

  /**
   * Get a contract by the address
   * @param address The address of the contract
   * @returns Contract or null if not found
   */
  public getContract(address: string): Contract | null {
    return this.contracts.get(address.toLowerCase()) || null;
  }

  /**
   * Remove a contract from the store
   * @param address The address of the contract to remove
   */
  @action
  public removeContract(address: string): void {
    this.contracts.delete(address.toLowerCase());
  }
}
