# Ten Tabs

A local Manifest V3 Chrome/Chromium extension that caps the browser at **10 tabs across all windows**.

When an 11th tab opens, the extension closes that newly created tab, queues its URL locally, and opens a chooser. Select an existing tab to replace (with a confirmation), open the queued URL after freeing space, or discard it. A notification and toolbar badge remain if Chrome suppresses the automatic popup.

## Install
1. Download or clone this repository.
2. Open chrome://extensions and enable Developer mode.
3. Click Load unpacked and select the repository folder.
4. Pin Ten Tabs to the toolbar for easy access.

## Test
Run `node --test tabs.test.js` (Node 18+; no dependencies). Manual test: open ten blank tabs, try an eleventh, verify the chooser, then replace a blank tab.

## Privacy and permissions
- tabs: count tabs, display titles, queue the new tab URL, and replace a selected tab.
- storage: retain queued URLs locally across extension worker restarts.
- notifications: explain why a new tab was closed.
No analytics, external servers, cookies, passwords, or page-content access. Queued URLs may contain sensitive query strings; discard them when no longer needed. Incognito is not enabled by default.

## Limitations
Chrome extensions cannot veto tab creation synchronously: an extra tab exists briefly before enforcement, so this is not a hard memory limit. Unsaved work in a tab can be lost when you confirm its closure. The extension saves a URL, not a complete tab/session snapshot. Existing sessions with more than ten tabs are not automatically trimmed at startup. Tabs are counted across all windows, including popups. Browser-managed tabs and extension policy restrictions can affect behavior.

## Files
manifest.json, background.js, popup.html, popup.js, popup.css, icon.png, tabs.test.js.
