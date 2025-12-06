export interface SongMetadata {
    title: string;
    bpm: number;
    startTime: number; // in seconds
    endTime: number; // in seconds
    filename: string;
}

export function parseSongFilename(filename: string): SongMetadata {
    // Example: "Bop Squad (87.5 BPM - 00;11.4 - 03;07.0).mp3"
    // Regex breakdown:
    // ^(.*?) - Title (min match)
    // \s*\( - Open paren
    // ([\d.]+) BPM - BPM
    // \s*-\s*
    // (\d{2});(\d{2}\.\d+) - Start Time (MM;SS.ms)
    // \s*-\s*
    // Updated Robust Regex to handle variations (e.g. "140BPM" no space, missing hyphens)
    // Structure: Title (BPM [sep] Start [sep] End).mp3
    const regex = /^(.*?)\s*\(([\d.]+)\s*BPM(?:[\s-]*)(\d{2});(\d{2}\.\d+)(?:[\s-]*)(\d{2});(\d{2}\.\d+)\)\.mp3$/i;

    // Clean filename if it has path
    const cleanName = filename.split('/').pop() || filename;

    const match = cleanName.match(regex);

    if (!match) {
        console.warn(`[SongParser] Could not parse filename: ${filename}`);
        return {
            title: cleanName,
            bpm: 90,
            startTime: 0,
            endTime: 0,
            filename: cleanName
        };
    }

    const title = match[1].trim();
    const bpm = parseFloat(match[2]);

    const startMin = parseInt(match[3]);
    const startSec = parseFloat(match[4]);
    const startTime = (startMin * 60) + startSec;

    const endMin = parseInt(match[5]);
    const endSec = parseFloat(match[6]);
    const endTime = (endMin * 60) + endSec;

    return {
        title,
        bpm,
        startTime,
        endTime,
        filename: cleanName
    };
}
