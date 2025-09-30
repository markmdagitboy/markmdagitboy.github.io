const fs = require('fs');
const path = require('path');

// Minimal fetch polyfill for Jest tests. When code under test calls fetch
// for local data files (data/*.json), return the parsed JSON from disk.
// For other URLs, return a 404-like response object so code paths that
// handle errors exercise the catch blocks without throwing ReferenceError.
global.fetch = async function (input, init) {
  try {
    const url = String(input || '');
    // Only handle local data files used in tests
    if (url.includes('data/hp_parts.json') || url.endsWith('/data/hp_parts.json')) {
      const p = path.resolve(__dirname, '..', 'data', 'hp_parts.json');
      const txt = fs.readFileSync(p, 'utf8');
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(txt),
        text: async () => txt,
      };
    }

    if (url.includes('data/supply_chain.json') || url.endsWith('/data/supply_chain.json')) {
      const p = path.resolve(__dirname, '..', 'data', 'supply_chain.json');
      const txt = fs.readFileSync(p, 'utf8');
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(txt),
        text: async () => txt,
      };
    }

    // Fallback: return a non-ok response rather than throwing
    return {
      ok: false,
      status: 404,
      json: async () => null,
      text: async () => '',
    };
  } catch (err) {
    return {
      ok: false,
      status: 500,
      json: async () => null,
      text: async () => '',
    };
  }
};
