import { JEPReceipt, SignedJEPReceipt, VerificationResult } from './types';
import { isReceiptValid } from './receipt';
import { verifySignature } from './signature';

/**
 * 验证 Receipt（链下验证）
 * 不依赖区块链，只验证签名和时间戳
 */
export async function verifyReceiptOffChain(
  signedReceipt: SignedJEPReceipt,
  publicKey?: Uint8Array | string
): Promise<VerificationResult> {
  const checks: any = {};
  
  // 1. 验证时间戳
  checks.timestampValid = isReceiptValid(signedReceipt);
  
  // 2. 验证签名（如果提供了公钥）
  if (publicKey) {
    checks.signatureValid = await verifySignature(signedReceipt, publicKey);
  }
  
  // 综合判断
  const isValid = checks.timestampValid && (publicKey ? checks.signatureValid : true);
  
  return {
    isValid,
    mode: 'offchain',
    timestamp: Math.floor(Date.now() / 1000),
    checks
  };
}

/**
 * 准备链上验证数据
 * 生成用于提交到 JEPVerifier 合约的数据
 */
export function prepareOnChainVerification(
  signedReceipt: SignedJEPReceipt,
  isValid: boolean
): {
  receiptHash: string;
  isValid: boolean;
} {
  // 注意：这里需要实际计算 Receipt 的哈希
  // 在完整实现中，应该调用 hashReceipt 函数
  // 这里为了简化，假设已经计算好
  return {
    receiptHash: '0x' + '0'.repeat(64), // 占位符
    isValid
  };
}

/**
 * 批量验证多个 Receipt
 */
export async function batchVerifyOffChain(
  signedReceipts: SignedJEPReceipt[],
  publicKeys?: (Uint8Array | string)[]
): Promise<VerificationResult[]> {
  return Promise.all(
    signedReceipts.map((receipt, i) => 
      verifyReceiptOffChain(receipt, publicKeys?.[i])
    )
  );
}
