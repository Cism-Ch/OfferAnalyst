# Loki Mode Dashboard Screenshots

This script captures screenshots of the Loki mode dashboard for documentation purposes.

## Purpose

Automatically takes screenshots of different sections of the Loki mode dashboard:
- **Agents Section**: Captures the agents grid and status
- **Task Queue Section**: Captures task queue columns and items

## Features

- **Consistent Viewport**: Sets 1400x900 viewport for consistent screenshots
- **Wait Strategy**: Waits for content to fully render before capturing
- **File Organization**: Saves screenshots with descriptive names
- **Directory Management**: Creates screenshots directory if needed

## Screenshot Process

1. Launch Puppeteer in headless mode
2. Load dashboard HTML from file
3. Wait for specific elements to render:
   - `#agents-grid`
   - `#queue-columns`
4. Capture individual sections:
   - `#agents-section` → `dashboard-agents.png`
   - `#queue-section` → `dashboard-tasks.png`

## File Structure

```
docs/screenshots/
├── dashboard-agents.png
└── dashboard-tasks.png
```

## Dependencies

- **Puppeteer**: Browser automation
- **File System**: Node.js fs module for file operations

## Usage

```bash
# From loki-mode/scripts/
node take-screenshots.js
```

## Code

```javascript
#!/usr/bin/env node
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function takeScreenshots() {
    const dashboardPath = path.resolve(__dirname, '../autonomy/.loki/dashboard/index.html');
    const screenshotsDir = path.resolve(__dirname, '../docs/screenshots');

    // Ensure screenshots directory exists
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport for consistent screenshots
    await page.setViewport({ width: 1400, height: 900 });

    console.log('Loading dashboard...');
    await page.goto(`file://${dashboardPath}`, { waitUntil: 'networkidle0' });

    // Wait for content to render
    await page.waitForSelector('#agents-grid');
    await page.waitForSelector('#queue-columns');

    // Screenshot 1: Agents section
    console.log('Taking agents screenshot...');
    const agentsSection = await page.$('#agents-section');
    await agentsSection.screenshot({
        path: path.join(screenshotsDir, 'dashboard-agents.png'),
        type: 'png'
    });
    console.log('Saved: dashboard-agents.png');

    // Screenshot 2: Task queue section
    console.log('Taking tasks screenshot...');
    const queueSection = await page.$('#queue-section');
    await queueSection.screenshot({
        path: path.join(screenshotsDir, 'dashboard-tasks.png'),
        type: 'png'
    });
    console.log('Saved: dashboard-tasks.png');

    await browser.close();
    console.log('Done! Screenshots saved to docs/screenshots/');
}

takeScreenshots().catch(console.error);
```