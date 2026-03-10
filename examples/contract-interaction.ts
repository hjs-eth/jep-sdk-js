/**
 * JEP SDK 合约交互示例
 * 演示如何与 JEPVerifier 合约交互
 */

import { ethers } from 'ethers';
import { JEPVerifierClient } from '@jep-eth/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🚀 JEP SDK 合约交互示例\n');

  // 1. 检查环境变量
  const verifierAddress = process.env.VERIFIER_ADDRESS;
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL;
  const network = process.env.ETHEREUM_NETWORK || 'sepolia';

  if (!verifierAddress || !privateKey || !rpcUrl) {
    console.error('❌ 请设置环境变量: VERIFIER_ADDRESS, PRIVATE_KEY, RPC_URL');
    console.log('\n示例:');
    console.log('VERIFIER_ADDRESS=0x123...');
    console.log('PRIVATE_KEY=0xabc...');
    console.log('RPC_URL=https://sepolia.infura.io/v3/your-project-id');
    return;
  }

  // 2. 创建 provider 和 signer
  console.log('📡 连接到以太坊网络...');
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  console.log('   网络:', network);
  console.log('   地址:', signer.address);
  console.log('   余额:', ethers.formatEther(await provider.getBalance(signer.address)), 'ETH');
  console.log();

  // 3. 初始化合约客户端
  console.log('📄 初始化 JEPVerifier 合约客户端...');
  const verifier = new JEPVerifierClient(verifierAddress, {
    network: network as any,
    rpcUrl
  }).connect(signer);

  // 4. 检查是否是授权验证者
  console.log('🔍 检查授权状态...');
  const isAuth = await verifier.isAuthorized(signer.address);
  console.log('   是否授权:', isAuth);

  if (!isAuth) {
    console.log('⚠️  当前地址不是授权验证者，只能查询无法记录验证');
  }
  console.log();

  // 5. 查询一个 Receipt 的验证状态
  const testReceiptHash = '0x' + '1'.repeat(64);
  console.log('🔎 查询 Receipt 验证状态...');
  console.log('   Receipt 哈希:', testReceiptHash);

  const isValid = await verifier.isReceiptValid(testReceiptHash);
  const timestamp = await verifier.getVerificationTimestamp(testReceiptHash);

  console.log('   是否有效:', isValid);
  console.log('   验证时间:', timestamp === 0 ? '未验证' : new Date(timestamp * 1000).toLocaleString());
  console.log();

  // 6. 如果是授权验证者，尝试记录验证结果
  if (isAuth) {
    console.log('✍️ 记录验证结果...');
    try {
      const receipt = await verifier.recordVerification(testReceiptHash, true);
      console.log('   交易哈希:', receipt.hash);
      console.log('   区块号:', receipt.blockNumber);
      console.log('   Gas 使用:', receipt.gasUsed.toString());

      // 再次查询验证状态
      const nowValid = await verifier.isReceiptValid(testReceiptHash);
      const nowTimestamp = await verifier.getVerificationTimestamp(testReceiptHash);

      console.log('\n📊 更新后状态:');
      console.log('   是否有效:', nowValid);
      console.log('   验证时间:', new Date(nowTimestamp * 1000).toLocaleString());
    } catch (error) {
      console.error('   记录失败:', error);
    }
  }
}

// 运行示例
main().catch(console.error);
