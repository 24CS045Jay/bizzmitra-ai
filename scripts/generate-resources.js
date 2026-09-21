import sharp from "sharp";
import fs from "fs";
import path from "path";

const resourcesDir = path.resolve("resources");
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

// 1. Icon SVG (1024x1024) with BizzMitra Neu-Bold-Minimal Terracotta & Graphite palette
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#24201D" />
      <stop offset="100%" stop-color="#141210" />
    </linearGradient>
    <linearGradient id="terracottaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B50" />
      <stop offset="100%" stop-color="#FF5A3C" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1024" height="1024" rx="228" fill="url(#bgGrad)" />

  <!-- Inner Soft Accent Border -->
  <rect x="16" y="16" width="992" height="992" rx="212" fill="none" stroke="#FF5A3C" stroke-width="6" stroke-opacity="0.4" />

  <!-- Emblem Center Box -->
  <rect x="236" y="236" width="552" height="552" rx="128" fill="url(#terracottaGrad)" filter="url(#shadow)" />

  <!-- Stylized B Monogram -->
  <path d="M 410 344 L 540 344 C 608 344 656 382 656 438 C 656 476 630 504 594 517 C 642 530 674 564 674 613 C 674 675 618 716 544 716 L 410 716 Z M 482 406 L 482 490 L 534 490 C 568 490 588 473 588 451 C 588 428 568 406 534 406 Z M 482 560 L 482 654 L 542 654 C 578 654 602 636 602 610 C 602 584 578 560 542 560 Z" fill="#FFFFFF" />

  <!-- AI Sparkle Motif Accent -->
  <path d="M 724 290 L 736 320 L 766 332 L 736 344 L 724 374 L 712 344 L 682 332 L 712 320 Z" fill="#FDFBF7" opacity="0.95" />
  <path d="M 770 370 L 778 390 L 798 398 L 778 406 L 770 426 L 762 406 L 742 398 L 762 390 Z" fill="#FFB3A6" opacity="0.9" />
</svg>
`;

// 2. Splash SVG (2732x2732) on warm off-white #F5F3EE base
const splashSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732" width="2732" height="2732">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B50" />
      <stop offset="100%" stop-color="#FF5A3C" />
    </linearGradient>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="40" flood-color="#D5D3CE" flood-opacity="0.8" />
    </filter>
  </defs>

  <!-- Warm Off-White Background -->
  <rect width="2732" height="2732" fill="#F5F3EE" />

  <!-- Centered Logo Mark -->
  <g transform="translate(1366, 1266)">
    <!-- Terracotta Badge -->
    <rect x="-240" y="-240" width="480" height="480" rx="112" fill="url(#logoGrad)" filter="url(#cardShadow)" />

    <!-- Stylized B Monogram -->
    <path d="M -80 -140 L 40 -140 C 104 -140 148 -104 148 -52 C 148 -16 124 10 90 22 C 136 34 166 66 166 112 C 166 170 114 208 44 208 L -80 208 Z M -14 -82 L -14 -4 L 34 -4 C 66 -4 86 -20 86 -41 C 86 -62 66 -82 34 -82 Z M -14 62 L -14 150 L 42 150 C 76 150 98 133 98 109 C 98 85 76 62 42 62 Z" fill="#FFFFFF" />

    <!-- Sparkle Motif -->
    <path d="M 210 -190 L 222 -160 L 252 -148 L 222 -136 L 210 -106 L 198 -136 L 168 -148 L 198 -160 Z" fill="#FFFFFF" opacity="0.95" />
  </g>

  <!-- Wordmark Text -->
  <text x="1366" y="1640" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="900" fill="#1B1B1B" text-anchor="middle" letter-spacing="-2">
    BizzMitra AI
  </text>
  <text x="1366" y="1710" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="600" fill="#8A8478" text-anchor="middle" letter-spacing="4">
    ENTERPRISE BLUEPRINT PLATFORM
  </text>
</svg>
`;

async function main() {
  console.log("Generating resources/icon.png (1024x1024)...");
  await sharp(Buffer.from(iconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(resourcesDir, "icon.png"));

  console.log("Generating resources/splash.png (2732x2732)...");
  await sharp(Buffer.from(splashSvg))
    .resize(2732, 2732)
    .png()
    .toFile(path.join(resourcesDir, "splash.png"));

  console.log("Assets created successfully in resources/");
}

main().catch((err) => {
  console.error("Resource generation error:", err);
  process.exit(1);
});
