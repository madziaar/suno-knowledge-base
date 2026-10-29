import { defineConfig } from 'wxt';

/**
 * Manifest V3 configuration.
 *
 * Permission budget: `storage` (+ `activeTab`, requested at runtime by the
 * content action) and host access limited to the exact hosts the companion
 * touches. No `tabs`, no `cookies`, no `<all_urls>`.
 *
 * `options_ui` is intentionally absent: WXT derives it from
 * `entrypoints/options/`, so declaring it here would duplicate the entry.
 *
 * The extension performs **zero** telemetry and no text processing over the
 * network. If a permission is ever added here, `local-first-extension` requires
 * a one-line justification in the PR body.
 */
export default defineConfig({
  manifestVersion: 3,
  srcDir: '.',
  outDir: '.output',
  manifest: {
    name: 'Suno Helper — local-first prompt companion',
    short_name: 'Suno Helper',
    description:
      'Build, clean, normalise and diff Suno prompts and lyrics entirely on your device. No account, no upload, no telemetry.',
    version: '0.1.0',
    permissions: ['storage'],
    host_permissions: ['https://suno.com/*', 'https://www.suno.com/*'],
    action: {
      default_title: 'Suno Helper',
      default_popup: 'popup.html',
    },
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
    web_accessible_resources: [
      {
        resources: ['icons/*'],
        matches: ['https://suno.com/*', 'https://www.suno.com/*'],
      },
    ],
    icons: {
      16: 'icons/16.png',
      32: 'icons/32.png',
      48: 'icons/48.png',
      128: 'icons/128.png',
    },
  },
  vite: () => ({
    build: {
      // Keep the bundle auditable: no dynamic import gymnastics.
      target: 'chrome114',
      sourcemap: false,
    },
  }),
});
