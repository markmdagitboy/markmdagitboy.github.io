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

    // Processor should be a paragraph
    const proc = Array.from(card.querySelectorAll('p.hp-part-desc')).find(p => p.textContent!.includes('Processor'));
    expect(proc).toBeTruthy();

    // Display should split into a list because of commas
    const displayList = card.querySelector('ul.hp-part-list');
    expect(displayList).toBeTruthy();
    expect(displayList!.querySelectorAll('li').length).toBeGreaterThan(1);

    // Screen PN and Battery PN should be separate paragraphs with buttons
    const screenP = Array.from(card.querySelectorAll('p.hp-part-extras')).find(p => p.textContent!.includes('Screen PN'));
    const batteryP = Array.from(card.querySelectorAll('p.hp-part-extras')).find(p => p.textContent!.includes('Battery PN'));
    expect(screenP).toBeTruthy();
    expect(batteryP).toBeTruthy();

    const screenBtn = screenP!.querySelector('button.copy-btn');
    const batteryBtn = batteryP!.querySelector('button.copy-btn');
    expect(screenBtn).toBeTruthy();
    expect(batteryBtn).toBeTruthy();
  });

  test('copy button shows temporary tooltip when clicked', async () => {
    const item = {
      'Model': 'Test',
      'Screen Replacement Part # (Common)': 'PN123'
    };
  const card = createHPPartCardForTest(item) as HTMLElement;

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });

    const p = card.querySelector('p.hp-part-extras')!;
    const btn = p.querySelector('button.copy-btn') as HTMLButtonElement;
    const tip = p.querySelector('.copy-tip') as HTMLElement;
    expect(tip.textContent).toBe('');

    // Click
    btn.click();
    // allow event loop
    await new Promise(r => setTimeout(r, 50));
    expect(tip.textContent).toBe('Copied!');

    // after timeout the tip should clear (the function uses 1200ms)
    await new Promise(r => setTimeout(r, 1250));
    expect(tip.textContent).toBe('');
  });
});
