/**
 * JEP SDK 完整工作流示例
 * 模拟一个完整的 agent 交易流程：
 * 1. Agent A 发布任务
 * 2. Agent B 投标并提供责任证明
 * 3. Agent A 验证责任证明
 * 4. Agent B 提交任务结果
 * 5. 争议处理（如有）
 */

import {
  createReceipt,
  signReceipt,
  verifyReceiptOffChain,
  hashReceipt,
  JEPReceipt,
  SignedJEPReceipt
} from '@jep-eth/sdk';

// 模拟的密钥对（实际应用应从安全存储加载）
class Agent {
  constructor(
    public readonly id: string,
    public readonly address: string,
    private readonly privateKey: Uint8Array,
    public readonly publicKey: Uint8Array
  ) {}

  // 创建责任证明
  async createResponsibilityProof(
    taskId: string,
    scope: string,
    validHours: number = 24
  ): Promise<SignedJEPReceipt> {
    const receipt = createReceipt({
      actor: this.address,
      decisionHash: '0x' + Buffer.from(taskId).toString('hex').padStart(64, '0'),
      authorityScope: scope,
      validUntil: Math.floor(Date.now() / 1000) + validHours * 3600
    });

    return await signReceipt(receipt, this.privateKey);
  }

  // 验证责任证明
  async verifyResponsibility(proof: SignedJEPReceipt): Promise<boolean> {
    const result = await verifyReceiptOffChain(proof, this.publicKey);
    return result.isValid;
  }
}

// 模拟数据
const TASK_ID = 'task-2026-03-10-001';
const TASK_SCOPE = 'image-generation';

async function main() {
  console.log('🎬 JEP SDK 完整工作流示例\n');

  // 1. 创建两个 agent
  console.log('👥 创建 Agent...');
  
  const agentA = new Agent(
    'Agent A (客户)',
    '0x1111111111111111111111111111111111111111',
    new Uint8Array(32).fill(1),
    new Uint8Array(32).fill(1)
  );

  const agentB = new Agent(
    'Agent B (服务商)',
    '0x2222222222222222222222222222222222222222',
    new Uint8Array(32).fill(2),
    new Uint8Array(32).fill(2)
  );

  console.log('   Agent A 地址:', agentA.address);
  console.log('   Agent B 地址:', agentB.address);
  console.log();

  // 2. Agent A 发布任务
  console.log('📢 Agent A 发布任务...');
  console.log('   任务 ID:', TASK_ID);
  console.log('   任务类型:', TASK_SCOPE);
  console.log();

  // 3. Agent B 准备投标，创建责任证明
  console.log('📝 Agent B 准备投标...');
  const proof = await agentB.createResponsibilityProof(TASK_ID, TASK_SCOPE);
  console.log('   生成责任证明:');
  console.log('   - 证明 ID:', proof.id);
  console.log('   - 有效期至:', new Date(proof.valid.until * 1000).toLocaleString());
  console.log('   - 签名算法:', proof.proof.alg);
  console.log();

  // 4. Agent A 验证责任证明
  console.log('✅ Agent A 验证责任证明...');
  const isValid = await agentA.verifyResponsibility(proof);
  console.log('   验证结果:', isValid ? '有效 ✓' : '无效 ✗');

  if (!isValid) {
    console.log('❌ 责任证明无效，拒绝投标');
    return;
  }
  console.log('   责任证明有效，接受投标');
  console.log();

  // 5. 模拟任务执行
  console.log('⚙️  Agent B 执行任务...');
  await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟耗时
  console.log('   任务完成，生成结果...');
  
  const resultHash = '0x' + 'f'.repeat(64); // 模拟结果哈希
  console.log('   结果哈希:', resultHash);
  console.log();

  // 6. Agent B 提交任务结果，同时提供交付责任证明
  console.log('📤 Agent B 提交任务结果...');
  const deliveryProof = await agentB.createResponsibilityProof(
    TASK_ID + '-delivery',
    'delivery'
  );

  console.log('   提交结果哈希:', resultHash);
  console.log('   交付证明 ID:', deliveryProof.id);
  console.log();

  // 7. Agent A 验证交付责任证明
  console.log('✅ Agent A 验证交付责任证明...');
  const isDeliveryValid = await agentA.verifyResponsibility(deliveryProof);
  console.log('   验证结果:', isDeliveryValid ? '有效 ✓' : '无效 ✗');

  if (!isDeliveryValid) {
    console.log('❌ 交付责任证明无效，发起争议');
    console.log('   → 争议流程：将证明提交给仲裁者');
  } else {
    console.log('   ✅ 交付责任证明有效，完成交易');
    console.log('   → 资金释放给 Agent B');
  }
  console.log();

  // 8. 打印完整责任链
  console.log('🔗 完整责任链:');
  console.log('   [Agent A] 发布任务');
  console.log('       ↓ 授权');
  console.log('   [Agent B] 投标（证明 ID:', proof.id.substring(0, 8), '...）');
  console.log('       ↓ 执行');
  console.log('   [Agent B] 交付（证明 ID:', deliveryProof.id.substring(0, 8), '...）');
  console.log('       ↓ 验证');
  console.log('   [Agent A] 确认完成');
  console.log();

  // 9. 可选：准备链上存证数据
  console.log('⛓️  准备链上存证...');
  const receiptHash = await hashReceipt(proof);
  console.log('   投标证明哈希 (用于提交到 JEPVerifier):', receiptHash);

  const deliveryHash = await hashReceipt(deliveryProof);
  console.log('   交付证明哈希:', deliveryHash);
}

// 运行示例
main().catch(console.error);
