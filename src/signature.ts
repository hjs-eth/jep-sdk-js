import * as ed from '@noble/ed25519';
import { JEPReceipt, SignedJEPReceipt } from './types';
import { hashReceipt } from './receipt';

/**
 * 使用 Ed25519 签名 Receipt
 */
export async function signReceipt(
  receipt: JEPReceipt,
  privateKey: Uint8Array | string
): Promise<SignedJEPReceipt> {
  // 计算 Receipt 哈希
  const receiptHash = await hashReceipt(receipt);
  
  // 将私钥转换为 Uint8Array
  const privateKeyBytes = typeof privateKey === 'string'
    ? hexToBytes(privateKey.replace('0x', ''))
    : privateKey;
  
  // 签名 (使用 @noble/ed25519)
  const signatureBytes = await ed.sign(
    hexToBytes(receiptHash.replace('0x', '')),
    privateKeyBytes
  );
  
  // 转换为十六进制字符串
  const signature = '0x' + bytesToHex(signatureBytes);
  
  return {
    ...receipt,
    proof: {
      alg: 'ed25519',
      signature
    }
  };
}

/**
 * 验证 Ed25519 签名
 */
export async function verifySignature(
  signedReceipt: SignedJEPReceipt,
  publicKey: Uint8Array | string
): Promise<boolean> {
  // 重新计算 Receipt 哈希
  const receiptHash = await hashReceipt(signedReceipt);
  
  // 将公钥转换为 Uint8Array
  const publicKeyBytes = typeof publicKey === 'string'
    ? hexToBytes(publicKey.replace('0x', ''))
    : publicKey;
  
  // 将签名转换为 Uint8Array
  const signatureBytes = hexToBytes(signedReceipt.proof.signature.replace('0x', ''));
  
  // 验证签名
  return await ed.verify(
    signatureBytes,
    hexToBytes(receiptHash.replace('0x', '')),
    publicKeyBytes
  );
}

/**
 * 辅助函数：十六进制字符串转字节数组
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * 辅助函数：字节数组转十六进制字符串
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
