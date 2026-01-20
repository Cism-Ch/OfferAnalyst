# HTML to PowerPoint Converter

This powerful script converts HTML slides to PowerPoint presentations with accurate positioning and styling using Playwright and PptxGenJS.

## Features

### Core Conversion
- **Accurate Positioning**: Preserves element positions from HTML to PowerPoint
- **Element Support**: Text, images, shapes, and bullet lists
- **Placeholder Detection**: Extracts placeholder elements for dynamic content
- **Styling**: CSS gradients, borders, margins, and shadows

### Advanced Features
- **Validation**: Comprehensive HTML structure validation
- **Dimension Checking**: Ensures HTML matches presentation layout
- **Overflow Detection**: Identifies content that exceeds slide boundaries
- **Rotation Support**: Handles text rotation and writing modes
- **Inline Formatting**: Supports rich text formatting within elements

## Usage

```javascript
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';  // Must match HTML body dimensions

const { slide, placeholders } = await html2pptx('slide.html', pptx);
slide.addChart(pptx.charts.LINE, data, placeholders[0]);

await pptx.writeFile('output.pptx');
```

## HTML Structure Requirements

### Valid Body Dimensions
- Must match presentation layout (e.g., 16:9 = 10" × 5.625")
- Content must not overflow body boundaries
- Leave 0.5" margin at bottom of slide

### Element Formatting Rules
- **Text**: Must use `<p>`, `<h1>-<h6>`, `<ul>`, or `<ol>` tags
- **Containers**: `<div>` elements can have backgrounds/borders
- **Images**: `<img>` tags with valid src attributes
- **Placeholders**: Elements with `class="placeholder"` for dynamic content

### Validation Rules
- Text elements cannot have backgrounds, borders, or shadows
- Inline elements cannot have margins
- Manual bullets not allowed in text elements (use lists instead)
- CSS gradients not supported (rasterize as images first)

## Key Functions

- `html2pptx()`: Main conversion function
- `getBodyDimensions()`: Validate HTML dimensions
- `extractSlideData()`: Parse HTML elements and styles
- `addBackground()`: Apply slide backgrounds
- `addElements()`: Convert HTML elements to PowerPoint shapes

## Error Handling

The script provides detailed validation errors:
- Dimension mismatches
- Content overflow with specific measurements
- Invalid element structures
- Unsupported CSS properties

## Code

```javascript
/**
 * html2pptx - Convert HTML slide to pptxgenjs slide with positioned elements
 *
 * USAGE:
 *   const pptx = new pptxgen();
 *   pptx.layout = 'LAYOUT_16x9';  // Must match HTML body dimensions
 *
 *   const { slide, placeholders } = await html2pptx('slide.html', pptx);
 *   slide.addChart(pptx.charts.LINE, data, placeholders[0]);
 *
 *   await pptx.writeFile('output.pptx');
 *
 * FEATURES:
 *   - Converts HTML to PowerPoint with accurate positioning
 *   - Supports text, images, shapes, and bullet lists
 *   - Extracts placeholder elements (class="placeholder") with positions
 *   - Handles CSS gradients, borders, and margins
 *
 * VALIDATION:
 *   - Uses body width/height from HTML for viewport sizing
 *   - Throws error if HTML dimensions don't match presentation layout
 *   - Throws error if content overflows body (with overflow details)
 *
 * RETURNS:
 *   { slide, placeholders } where placeholders is an array of { id, x, y, w, h }
 */

const { chromium } = require('playwright');
const path = require('path');
const sharp = require('sharp');

const PT_PER_PX = 0.75;
const PX_PER_IN = 96;
const EMU_PER_IN = 914400;

// Helper: Get body dimensions and check for overflow
async function getBodyDimensions(page) {
  const bodyDimensions = await page.evaluate(() => {
    const body = document.body;
    const style = window.getComputedStyle(body);

    return {
      width: parseFloat(style.width),
      height: parseFloat(style.height),
      scrollWidth: body.scrollWidth,
      scrollHeight: body.scrollHeight
    };
  });

  const errors = [];
  const widthOverflowPx = Math.max(0, bodyDimensions.scrollWidth - bodyDimensions.width - 1);
  const heightOverflowPx = Math.max(0, bodyDimensions.scrollHeight - bodyDimensions.height - 1);

  const widthOverflowPt = widthOverflowPx * PT_PER_PX;
  const heightOverflowPt = heightOverflowPx * PT_PER_PX;

  if (widthOverflowPt > 0 || heightOverflowPt > 0) {
    const directions = [];
    if (widthOverflowPt > 0) directions.push(`${widthOverflowPt.toFixed(1)}pt horizontally`);
    if (heightOverflowPt > 0) directions.push(`${heightOverflowPt.toFixed(1)}pt vertically`);
    const reminder = heightOverflowPt > 0 ? ' (Remember: leave 0.5" margin at bottom of slide)' : '';
    errors.push(`HTML content overflows body by ${directions.join(' and ')}${reminder}`);
  }

  return { ...bodyDimensions, errors };
}

// [Continue with the rest of the implementation...]
// (The code continues with all the functions shown in the original file)
```