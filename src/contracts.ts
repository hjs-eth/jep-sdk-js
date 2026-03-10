import { ethers } from 'ethers';
import { JEPConfig } from './types';

// JEPVerifier 合约的 ABI（简化版）
const JEP_VERIFIER_ABI = [
  "function recordVerification(bytes32 receiptHash, bool isValid) external",
  "function isReceiptValid(bytes32 receiptHash) external view returns (bool)",
  "function getVerificationTimestamp(bytes32 receiptHash) external view returns (uint256)",
  "function addVerifier(address verifier) external",
  "function removeVerifier(address verifier) external",
  "function isAuthorized(address verifier) external view returns (bool)",
  "event ReceiptVerified(bytes32 indexed receiptHash, bool isValid, address indexed verifier, uint256 timestamp)"
];

/**
 * JEPVerifier 合约客户端
 */
export class JEPVerifierClient {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(
    address: string,
    config: JEPConfig = {}
  ) {
    this.provider = config.rpcUrl
      ? new ethers.JsonRpcProvider(config.rpcUrl)
      : ethers.getDefaultProvider(config.network || 'mainnet');
    
    this.contract = new ethers.Contract(address, JEP_VERIFIER_ABI, this.provider);
  }

  /**
   * 连接签名器（用于发送交易）
   */
  connect(signer: ethers.Signer): this {
    this.signer = signer;
    this.contract = this.contract.connect(signer) as ethers.Contract;
    return this;
  }

  /**
   * 查询收据是否有效
   */
  async isReceiptValid(receiptHash: string): Promise<boolean> {
    return await this.contract.isReceiptValid(receiptHash);
  }

  /**
   * 获取验证时间戳
   */
  async getVerificationTimestamp(receiptHash: string): Promise<number> {
    const timestamp = await this.contract.getVerificationTimestamp(receiptHash);
    return Number(timestamp);
  }

  /**
   * 记录验证结果（需要签名器）
   */
  async recordVerification(
    receiptHash: string,
    isValid: boolean
  ): Promise<ethers.ContractTransactionReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to send transactions');
    }
    
    const tx = await this.contract.recordVerification(receiptHash, isValid);
    return await tx.wait();
  }

  /**
   * 检查地址是否授权
   */
  async isAuthorized(address: string): Promise<boolean> {
    return await this.contract.isAuthorized(address);
  }
}

// JEP8183Extension 合约的 ABI（简化版）
const JEP_8183_EXTENSION_ABI = [
  "function fundTaskWithResponsibility(uint256 taskId, bytes32 receiptHash, bool isValid) external payable",
  "function submitTaskWithProof(uint256 taskId, bytes32 resultHash, bytes32 responsibilityProof) external",
  "function getTaskResponsibility(uint256 taskId) external view returns (bytes32 receiptHash, bytes32 proofHash, bool verified)"
];

/**
 * JEP8183Extension 合约客户端
 */
export class JEP8183ExtensionClient {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(
    address: string,
    config: JEPConfig = {}
  ) {
    this.provider = config.rpcUrl
      ? new ethers.JsonRpcProvider(config.rpcUrl)
      : ethers.getDefaultProvider(config.network || 'mainnet');
    
    this.contract = new ethers.Contract(address, JEP_8183_EXTENSION_ABI, this.provider);
  }

  /**
   * 连接签名器
   */
  connect(signer: ethers.Signer): this {
    this.signer = signer;
    this.contract = this.contract.connect(signer) as ethers.Contract;
    return this;
  }

  /**
   * 带责任证明的资助任务
   */
  async fundTaskWithResponsibility(
    taskId: number,
    receiptHash: string,
    isValid: boolean,
    value: ethers.BigNumberish
  ): Promise<ethers.ContractTransactionReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to send transactions');
    }
    
    const tx = await this.contract.fundTaskWithResponsibility(
      taskId,
      receiptHash,
      isValid,
      { value }
    );
    return await tx.wait();
  }

  /**
   * 带责任证明的提交任务
   */
  async submitTaskWithProof(
    taskId: number,
    resultHash: string,
    responsibilityProof: string
  ): Promise<ethers.ContractTransactionReceipt> {
    if (!this.signer) {
      throw new Error('Signer required to send transactions');
    }
    
    const tx = await this.contract.submitTaskWithProof(
      taskId,
      resultHash,
      responsibilityProof
    );
    return await tx.wait();
  }

  /**
   * 获取任务责任链
   */
  async getTaskResponsibility(taskId: number): Promise<{
    receiptHash: string;
    proofHash: string;
    verified: boolean;
  }> {
    const [receiptHash, proofHash, verified] = await this.contract.getTaskResponsibility(taskId);
    return { receiptHash, proofHash, verified };
  }
}
