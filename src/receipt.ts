import { randomBytes } from 'crypto';
import { JEPReceipt } from './types';

/**
 * 生成 UUIDv7 (简化版)
 * 实际生产环境建议使用专门的 uuid 库
 */
function generateUUIDv7(): string {
  const bytes = randomBytes(16);
  // 设置版本为 7
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // 设置变体为 RFC 4122
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  const hex = bytes.toString('hex');
  return `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20)}`;
}

/**
 * 创建新的 JEP Receipt
 */
export function createReceipt(params: {
  actor: string;
  decisionHash: string;
  authorityScope: string;
  validFrom?: number;
  validUntil?: number;
  prevHash?: string | null;
  extensions?: Record<string, any>;
}): JEPReceipt {
  const now = Math.floor(Date.now() / 1000);
  
  return {
    version: '1.0',
    id: generateUUIDv7(),
    actor: params.actor,
    decisionHash: params.decisionHash,
    authorityScope: params.authorityScope,
    valid: {
      from: params.validFrom || now,
      until: params.validUntil || now + 3600 // 默认1小时有效期
    },
    prevHash: params.prevHash || null,
    extensions: params.extensions
  };
}

/**
 * 计算 Receipt 的哈希 (用于链上验证)
 */
export async function hashReceipt(receipt: JEPReceipt): Promise<string> {
  // 移除 proof 字段后计算哈希
  const { proof, ...receiptWithoutProof } = receipt as any;
  
  // 序列化为规范化的 JSON 字符串
  const canonicalJson = JSON.stringify(receiptWithoutProof, Object.keys(receiptWithoutProof).sort());
  
  // 使用 SHA-256 计算哈希
  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalJson);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // 转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 验证 Receipt 的时间戳是否有效
 */
export function isReceiptValid(receipt: JEPReceipt): boolean {
  const now = Math.floor(Date.now() / 1000);
  return receipt.valid.from <= now && receipt.valid.until >= now;
}
