/**
 * Test the map rendering modes and modal behavior using the exported global hooks
 */
import fs from 'fs';
import path from 'path';

// Load the page skeleton (minimal) so DOM elements exist
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

describe('Manufacturer maps render', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = indexHtml;
    // ensure the map container and select exist
  });

  test('renders embedded view', async () => {
  // import the script module to register handlers
  const script = await import('../ts/script');
  // Simulate DOMContentLoaded so the script's listeners run
  document.dispatchEvent(new Event('DOMContentLoaded'));
  // run embedded render
  await new Promise(resolve => setTimeout(resolve, 5));
  (globalThis as any).__mapsRender.renderEmbedded();
    const container = document.getElementById('map-container');
    expect(container).not.toBeNull();
    // should contain at least one iframe
    const iframes = container!.querySelectorAll('iframe');
    expect(iframes.length).toBeGreaterThanOrEqual(1);
  });

  test('renders thumbnails and opens modal', async () => {
  const script = await import('../ts/script');
  document.dispatchEvent(new Event('DOMContentLoaded'));
  await new Promise(resolve => setTimeout(resolve, 5));
  (globalThis as any).__mapsRender.renderThumbnails();
    const container = document.getElementById('map-container');
    expect(container).not.toBeNull();
    // thumbnails are buttons
    const thumbs = container!.querySelectorAll('.map-thumb');
    expect(thumbs.length).toBeGreaterThanOrEqual(1);
    // click the first thumbnail to open modal
    const first = thumbs[0] as HTMLElement;
    first.click();
    const modal = document.getElementById('map-modal');
    expect(modal).not.toBeNull();
    expect(modal!.classList.contains('hidden')).toBe(false);
    // close modal
    const closeBtn = modal!.querySelector('.map-modal-close') as HTMLElement | null;
    if (closeBtn) closeBtn.click();
    expect(modal!.classList.contains('hidden')).toBe(true);
  });
});
