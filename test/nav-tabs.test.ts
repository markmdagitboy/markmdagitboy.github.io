/**
 * @jest-environment jsdom
 */

import fs from 'fs';
import path from 'path';

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

describe('Top navigation tabs', () => {
  beforeEach(async () => {
    document.documentElement.innerHTML = indexHtml;
  });

  test('clicking nav buttons shows correct section', async () => {
    // Import the script so handlers register
    const script = await import('../ts/script');
    // Trigger DOMContentLoaded listeners
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Wait a tick for any async initialization
    await new Promise(r => setTimeout(r, 10));

    const skillsBtn = document.querySelector('button[data-tab="skills"]') as HTMLElement;
    const projectsBtn = document.querySelector('button[data-tab="projects"]') as HTMLElement;
    const blogBtn = document.querySelector('button[data-tab="blog"]') as HTMLElement;

    expect(skillsBtn).toBeTruthy();
    expect(projectsBtn).toBeTruthy();
    expect(blogBtn).toBeTruthy();

    // Click Projects
    projectsBtn.click();
    await new Promise(r => setTimeout(r, 10));
    const projectsSection = document.getElementById('projects');
    const skillsSection = document.getElementById('skills');

    expect(projectsSection).not.toBeNull();
    expect(projectsSection!.classList.contains('hidden')).toBe(false);
    expect(skillsSection).not.toBeNull();
    expect(skillsSection!.classList.contains('hidden')).toBe(true);

    // Click Blog
    blogBtn.click();
    await new Promise(r => setTimeout(r, 10));
    const blogSection = document.getElementById('blog');
    expect(blogSection).not.toBeNull();
    expect(blogSection!.classList.contains('hidden')).toBe(false);
    expect(projectsSection!.classList.contains('hidden')).toBe(true);
  });
});
