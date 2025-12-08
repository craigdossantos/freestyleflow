const sharp = require('sharp');
const path = require('path');

// FreestyleFlow theme colors
const COLORS = {
    background: '#fffdf0',
    text: '#2c3e50',
    accent: '#e74c3c',
};

// Create an SVG icon for FreestyleFlow
// Design: A stylized microphone with sound waves and a bouncing ball
const createIconSVG = (size) => {
    const scale = size / 1024;

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  <!-- Background -->
  <rect width="1024" height="1024" fill="${COLORS.background}"/>

  <!-- Notebook lines (hand-drawn style) -->
  <g stroke="${COLORS.text}" stroke-width="3" opacity="0.15">
    <path d="M100,250 Q512,245 924,252" fill="none"/>
    <path d="M100,400 Q512,405 924,398" fill="none"/>
    <path d="M100,550 Q512,548 924,553" fill="none"/>
    <path d="M100,700 Q512,703 924,698" fill="none"/>
    <path d="M100,850 Q512,847 924,852" fill="none"/>
  </g>

  <!-- Red margin line -->
  <path d="M150,50 Q148,512 152,974" stroke="${COLORS.accent}" stroke-width="4" fill="none" opacity="0.3"/>

  <!-- Microphone body -->
  <g transform="translate(512, 480)">
    <!-- Mic head (grille) -->
    <ellipse cx="0" cy="-80" rx="120" ry="150" fill="none" stroke="${COLORS.text}" stroke-width="18"/>
    <ellipse cx="0" cy="-80" rx="90" ry="120" fill="${COLORS.text}" opacity="0.1"/>

    <!-- Grille lines -->
    <g stroke="${COLORS.text}" stroke-width="6" opacity="0.6">
      <path d="M-70,-160 Q0,-150 70,-160" fill="none"/>
      <path d="M-85,-120 Q0,-110 85,-120" fill="none"/>
      <path d="M-90,-80 Q0,-70 90,-80" fill="none"/>
      <path d="M-85,-40 Q0,-30 85,-40" fill="none"/>
      <path d="M-70,0 Q0,10 70,0" fill="none"/>
    </g>

    <!-- Mic stand connector -->
    <rect x="-30" y="60" width="60" height="40" rx="5" fill="${COLORS.text}"/>

    <!-- Mic stand -->
    <rect x="-15" y="100" width="30" height="180" fill="${COLORS.text}"/>

    <!-- Stand base -->
    <ellipse cx="0" cy="290" rx="100" ry="25" fill="${COLORS.text}"/>
  </g>

  <!-- Sound waves (left) -->
  <g stroke="${COLORS.accent}" stroke-width="12" fill="none" stroke-linecap="round">
    <path d="M280,350 Q240,400 280,450" opacity="0.4"/>
    <path d="M230,300 Q170,400 230,500" opacity="0.6"/>
    <path d="M180,250 Q100,400 180,550" opacity="0.8"/>
  </g>

  <!-- Sound waves (right) -->
  <g stroke="${COLORS.accent}" stroke-width="12" fill="none" stroke-linecap="round">
    <path d="M744,350 Q784,400 744,450" opacity="0.4"/>
    <path d="M794,300 Q854,400 794,500" opacity="0.6"/>
    <path d="M844,250 Q924,400 844,550" opacity="0.8"/>
  </g>

  <!-- Bouncing ball (metronome) -->
  <circle cx="750" cy="180" r="60" fill="${COLORS.accent}"/>

  <!-- Ball motion trail -->
  <g fill="${COLORS.accent}" opacity="0.3">
    <circle cx="680" cy="220" r="30"/>
    <circle cx="620" cy="270" r="18"/>
  </g>

  <!-- "FF" letters stylized -->
  <g transform="translate(180, 750)" fill="${COLORS.text}" font-family="Arial Black, sans-serif" font-weight="900">
    <text x="0" y="0" font-size="180" opacity="0.15">FF</text>
  </g>

  <!-- Hand-drawn border -->
  <path d="M30,30 Q512,25 994,32 Q999,512 992,992 Q512,997 32,990 Q27,512 30,30"
        fill="none" stroke="${COLORS.text}" stroke-width="8" opacity="0.2"/>
</svg>`;
};

async function generateIcons() {
    const outputDir = path.join(__dirname, '..', 'assets', 'images');

    // Generate main icon (1024x1024)
    const mainIconSvg = createIconSVG(1024);
    await sharp(Buffer.from(mainIconSvg))
        .png()
        .toFile(path.join(outputDir, 'icon.png'));
    console.log('Created icon.png (1024x1024)');

    // Generate adaptive icon (same as main for now)
    await sharp(Buffer.from(mainIconSvg))
        .png()
        .toFile(path.join(outputDir, 'adaptive-icon.png'));
    console.log('Created adaptive-icon.png (1024x1024)');

    // Generate splash icon
    await sharp(Buffer.from(mainIconSvg))
        .png()
        .toFile(path.join(outputDir, 'splash-icon.png'));
    console.log('Created splash-icon.png (1024x1024)');

    // Generate favicon (48x48)
    const faviconSvg = createIconSVG(48);
    await sharp(Buffer.from(faviconSvg))
        .png()
        .toFile(path.join(outputDir, 'favicon.png'));
    console.log('Created favicon.png (48x48)');

    console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
