# JEP SDK for JavaScript

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@jep-eth/sdk)](https://www.npmjs.com/package/@jep-eth/sdk)

JavaScript/TypeScript SDK for the JEP (Judgment Event Protocol). Generate, sign, and verify JEP Receipts for agent-to-agent transactions.

## Installation

```bash
npm install @jep-eth/sdk
```

## Quick Start

```typescript
import { createReceipt, signReceipt, verifyReceiptOffChain } from '@jep-eth/sdk';

// 1. Create a receipt
const receipt = createReceipt({
  actor: '0x1234567890123456789012345678901234567890',
  decisionHash: '0xabcdef1234567890',
  authorityScope: 'erc-8183'
});

// 2. Sign it (using Ed25519 private key)
const signedReceipt = await signReceipt(receipt, privateKey);

// 3. Verify it
const result = await verifyReceiptOffChain(signedReceipt, publicKey);
console.log(result.isValid); // true or false
```

## Features

- ✅ Generate JEP Receipts (UUIDv7, timestamp validation)
- ✅ Sign receipts with Ed25519
- ✅ Verify signatures and timestamps
- ✅ Interact with JEPVerifier smart contract
- ✅ Full TypeScript support

## Documentation

- [API Reference](./docs/API.md)
- [Integration Guide](./docs/INTEGRATION.md)
- [Examples](./examples)

## Related Projects

- [jep-erc-bridge](https://github.com/jep-eth/jep-erc-bridge) - Smart contracts for JEP on Ethereum

## License

MIT
