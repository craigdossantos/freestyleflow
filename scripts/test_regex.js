const filenames = [
    "Are We Cooked (96 BPM - 00;20.1 - 03;21.0).mp3",
    "Beep Boo Boo Bop (140BPM 00;13.9 - 03;01.7).mp3",
    "Bop Squad (87.5 BPM - 00;11.4 - 03;07.0).mp3",
    "Chillaxin (91.4 BPM - 00;21.0 - 03;29.8).mp3"
];

// Current Regex
const regex = /^(.*?)\s*\(([\d.]+)\s*BPM\s*-\s*(\d{2});(\d{2}\.\d+)\s*-\s*(\d{2});(\d{2}\.\d+)\)\.mp3$/;

filenames.forEach(f => {
    console.log(`Testing: "${f}"`);
    const match = f.match(regex);
    if (match) {
        console.log(`  MATCH: Title="${match[1]}", BPM="${match[2]}", Start="${match[3]};${match[4]}", End="${match[5]};${match[6]}"`);
    } else {
        console.log(`  FAIL`);
    }
});

// Proposed Robust Regex
// Allow optional spaces, optional hyphens between sections
// Structure: Title (BPM [sep] Start [sep] End).mp3
console.log('\n--- Testing Robust Regex ---');
const robustRegex = /^(.*?)\s*\(([\d.]+)\s*BPM(?:[\s-]*)(\d{2});(\d{2}\.\d+)(?:[\s-]*)(\d{2});(\d{2}\.\d+)\)\.mp3$/i;

filenames.forEach(f => {
    console.log(`Testing: "${f}"`);
    const match = f.match(robustRegex);
    if (match) {
        console.log(`  MATCH: Title="${match[1]}", BPM="${match[2]}", Start="${match[3]};${match[4]}", End="${match[5]};${match[6]}"`);
    } else {
        console.log(`  FAIL`);
    }
});
