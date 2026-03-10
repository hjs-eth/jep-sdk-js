/**
 * JEP Receipt 核心数据结构
 * 对应 JEP 协议中的 Receipt 格式
 */
export interface JEPReceipt {
  /** 协议版本 */
  version: string;
  
  /** 事件ID (UUIDv7) */
  id: string;
  
  /** 责任主体 (以太坊地址或 DID) */
  actor: string;
  
  /** 决策内容的哈希 */
  decisionHash: string;
  
  /** 权限范围 (如 'erc-8183') */
  authorityScope: string;
  
  /** 有效期 */
  valid: {
    from: number;   // Unix 时间戳
    until: number;  // Unix 时间戳
  };
  
  /** 前一个事件的哈希（如果是链上事件） */
  prevHash?: string | null;
  
  /** 扩展字段 */
  extensions?: Record<string, any>;
}

/**
 * 签名后的 JEP Receipt
 */
export interface SignedJEPReceipt extends JEPReceipt {
  /** 签名信息 */
  proof: {
    /** 签名算法 (ed25519, ecdsa, etc.) */
    alg: string;
    
    /** 签名值 (base64 编码) */
    signature: string;
    
    /** 公钥标识 (可选) */
    keyId?: string;
  };
}

/**
 * Receipt 验证结果
 */
export interface VerificationResult {
  /** 是否有效 */
  isValid: boolean;
  
  /** 验证模式 (platform/open/dual) */
  mode: string;
  
  /** 验证时间戳 */
  timestamp: number;
  
  /** 失败原因（如果无效） */
  reason?: string;
  
  /** 验证详情 */
  checks?: {
    signatureValid?: boolean;
    chainIntegrity?: boolean;
    timestampValid?: boolean;
  };
}

/**
 * SDK 配置选项
 */
export interface JEPConfig {
  /** 验证器合约地址 */
  verifierAddress?: string;
  
  /** 以太坊网络 */
  network?: 'mainnet' | 'sepolia' | 'hardhat';
  
  /** RPC URL（可选，默认使用 ethers 默认） */
  rpcUrl?: string;
}
