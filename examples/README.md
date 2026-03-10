# JEP SDK 示例

本目录包含 JEP SDK 的各种使用示例。

## 快速开始

```bash
# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

## 示例列表

### 1. 基础用法 (basic-usage.ts)
演示最核心的功能：创建、签名、验证 Receipt。

```bash
npm run start:basic
```

### 2. 合约交互 (contract-interaction.ts)
演示如何与 JEPVerifier 智能合约交互，需要部署合约并配置环境变量。

```bash
npm run start:contract
```

### 3. 完整工作流 (full-workflow.ts)
模拟一个完整的 agent 交易流程，包含投标、执行、交付、验证全流程。

```bash
npm run start:full
```

## 环境变量配置

创建 `.env` 文件，包含以下配置：

```
# 测试用的私钥（不要用于主网）
PRIVATE_KEY=你的私钥

# 合约地址（从 jep-erc-bridge 部署获得）
VERIFIER_ADDRESS=0x...
EXTENSION_ADDRESS=0x...
MOCK_ADDRESS=0x...

# 以太坊网络
ETHEREUM_NETWORK=sepolia
RPC_URL=https://sepolia.infura.io/v3/你的项目ID
```

## 注意事项

- 所有示例中的密钥都是测试用的，**不要用于生产环境**
- 合约交互示例需要先部署 [jep-erc-bridge](https://github.com/jep-eth/jep-erc-bridge) 合约
- 运行前请确保已安装依赖：`npm install`
