/**
 * JEP SDK 基础用法示例
 * 演示如何创建、签名和验证 Receipt
 */

import {
  createReceipt,
  signReceipt,
  verifyReceiptOffChain,
  hashReceipt,
  JEPReceipt,
  SignedJEPReceipt
} from '@jep-eth/sdk';

// 测试用的 Ed25519 密钥对（实际使用时应从安全的地方加载）
// 这里使用固定的测试密钥（仅用于示例）
const TEST_PRIVATE_KEY = new Uint8Array(32).fill(1); // 示例用，不要用于生产
const TEST_PUBLIC_KEY = new Uint8Array(32).fill(2);  // 示例用，不要用于生产

async function main() {
  console.log('🚀 JEP SDK 基础用法示例\n');

  // 1. 创建 Receipt
  console.log('📝 创建 JEP Receipt...');
  const receipt = createReceipt({
    actor: '0x742d35Cc6634C0532925a3b844Bc5e7591f9c7b5',
    decisionHash: '0x' + 'a'.repeat(64),
    authorityScope: 'erc-8183',
    validFrom: Math.floor(Date.now() / 1000),
    validUntil: Math.floor(Date.now() / 1000) + 3600 // 1小时有效期
  });

  console.log('   ID:', receipt.id);
  console.log('   Actor:', receipt.actor);
  console.log('   有效期:', new Date(receipt.valid.from * 1000).toLocaleString(), '->', new Date(receipt.valid.until * 1000).toLocaleString());
  console.log();

  // 2. 计算 Receipt 哈希
  console.log('🔐 计算 Receipt 哈希...');
  const receiptHash = await hashReceipt(receipt);
  console.log('   哈希:', receiptHash);
  console.log();

  // 3. 签名 Receipt
  console.log('✍️ 签名 Receipt...');
  const signedReceipt = await signReceipt(receipt, TEST_PRIVATE_KEY);
  console.log('   签名算法:', signedReceipt.proof.alg);
  console.log('   签名值:', signedReceipt.proof.signature.substring(0, 30) + '...');
  console.log();

  // 4. 验证 Receipt（链下）
  console.log('✅ 验证 Receipt（链下）...');
  const verificationResult = await verifyReceiptOffChain(
    signedReceipt,
    TEST_PUBLIC_KEY
  );

  console.log('   验证结果:', verificationResult.isValid ? '有效' : '无效');
  console.log('   验证模式:', verificationResult.mode);
  console.log('   检查项:', verificationResult.checks);

  if (verificationResult.isValid) {
    console.log('\n🎉 Receipt 验证通过！');
  } else {
    console.log('\n❌ Receipt 验证失败:', verificationResult.reason);
  }
}

// 运行示例
main().catch(console.error);
