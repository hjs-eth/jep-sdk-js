import { createReceipt, hashReceipt, isReceiptValid } from '../receipt';

describe('Receipt Module', () => {
  test('createReceipt should generate valid receipt', () => {
    const receipt = createReceipt({
      actor: '0x1234567890123456789012345678901234567890',
      decisionHash: '0xabcdef',
      authorityScope: 'erc-8183'
    });
    
    expect(receipt.version).toBe('1.0');
    expect(receipt.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(receipt.valid.until).toBeGreaterThan(receipt.valid.from);
  });

  test('hashReceipt should produce consistent hash', async () => {
    const receipt = createReceipt({
      actor: '0x1234567890123456789012345678901234567890',
      decisionHash: '0xabcdef',
      authorityScope: 'erc-8183'
    });
    
    const hash1 = await hashReceipt(receipt);
    const hash2 = await hashReceipt(receipt);
    
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^0x[0-9a-f]{64}$/);
  });

  test('isReceiptValid should check time validity', () => {
    const now = Math.floor(Date.now() / 1000);
    
    const validReceipt = createReceipt({
      actor: '0x1234',
      decisionHash: '0xabcd',
      authorityScope: 'test',
      validFrom: now - 100,
      validUntil: now + 100
    });
    
    const expiredReceipt = createReceipt({
      actor: '0x1234',
      decisionHash: '0xabcd',
      authorityScope: 'test',
      validFrom: now - 200,
      validUntil: now - 100
    });
    
    expect(isReceiptValid(validReceipt)).toBe(true);
    expect(isReceiptValid(expiredReceipt)).toBe(false);
  });
});
