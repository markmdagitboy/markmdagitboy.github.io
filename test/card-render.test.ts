/**
 * @jest-environment jsdom
 */

import { createHPPartCardForTest } from '../ts/script';

describe('HP Part card rendering', () => {
  test('renders spec fields as separate paragraphs and lists', () => {
    const item = {
      'Model': 'HP EliteBook G5',
      'Processor': 'Intel Core 8th Gen — i5-8250U, i5-8350U, i7-8550U, i7-8650U with vPro',
      'Memory': 'Up to 32 GB',
      'Memory Type': 'DDR4-2400 SDRAM',
      'Internal Drive': 'Up to 1TB NVMe SSD',
      'Display': '13.3", 14", 15.6" (FHD, UHD 4K, Sure View)',
      'Graphics': 'Intel UHD Graphics 620',
      'External I/O Ports': 'Thunderbolt 3, USB 3.0, HDMI, RJ-45',
      'Weight': 'Starting at 3.32 lb (1.5 kg)',
      'Warranty': '3 year limited warranty',
      'Screen Replacement Part # (Common)': 'L18313-001 (for 840 G5 non-touch), L14384-001 (touch)',
      'Battery Replacement Part # (Common)': 'SS03XL'
    };

  const card = createHPPartCardForTest(item) as HTMLElement;
    // Title
    const h4 = card.querySelector('h4');
    expect(h4).not.toBeNull();
    expect(h4!.textContent).toBe('HP EliteBook G5');

  // Processor should be a paragraph (now using supply-chain-desc class)
  const proc = Array.from(card.querySelectorAll('p.supply-chain-desc')).find(p => p.textContent!.includes('Processor'));
    expect(proc).toBeTruthy();

  // Display should be rendered as a paragraph (matching supply-chain styling)
  const displayP = Array.from(card.querySelectorAll('p.supply-chain-desc')).find(p => p.textContent!.includes('Display'));
  expect(displayP).toBeTruthy();
  expect(displayP!.textContent).toContain('13.3"');

  // Screen PN and Battery PN should be separate paragraphs using supply-chain-desc class
  const screenPNew = Array.from(card.querySelectorAll('p.supply-chain-desc')).find(p => p.textContent!.includes('Screen PN'));
  const batteryPNew = Array.from(card.querySelectorAll('p.supply-chain-desc')).find(p => p.textContent!.includes('Battery PN'));
  expect(screenPNew).toBeTruthy();
  expect(batteryPNew).toBeTruthy();
  });

  // copy-button tests removed because HP part cards now use the same paragraph styling as Supply Chain entries
  test('screen and battery PNs are rendered as paragraphs without copy buttons', () => {
  const item = {
    'Model': 'Test',
    'Screen Replacement Part # (Common)': 'PN123'
  };
  const card = createHPPartCardForTest(item) as HTMLElement;
  const p = card.querySelector('p.supply-chain-desc')!;
  expect(p.textContent).toContain('Screen PN');
  const btn = p.querySelector('button.copy-btn');
  expect(btn).toBeNull();
  });
});
