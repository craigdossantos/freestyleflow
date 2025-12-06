import { parseSongFilename, SongMetadata } from '../utils/songParser';

// We need to require the assets to get their module IDs/URIs for Expo AV
export const SONG_FILES = {
    'Are We Cooked': require('../music/Are We Cooked (96 BPM - 00;20.1 - 03;21.0).mp3'),
    'Beep Boo Boo Bop': require('../music/Beep Boo Boo Bop (140BPM 00;13.9 - 03;01.7).mp3'),
    'Bop Squad': require('../music/Bop Squad (87.5 BPM - 00;11.4 - 03;07.0).mp3'),
    'Chillaxin': require('../music/Chillaxin (91.4 BPM - 00;21.0 - 03;29.8).mp3'),
};

// We manually list the filenames to parse metadata
// Ideally this would be dynamic, but in React Native we need to require assets
const RAW_FILENAMES = [
    "Are We Cooked (96 BPM - 00;20.1 - 03;21.0).mp3",
    "Beep Boo Boo Bop (140BPM 00;13.9 - 03;01.7).mp3",
    "Bop Squad (87.5 BPM - 00;11.4 - 03;07.0).mp3",
    "Chillaxin (91.4 BPM - 00;21.0 - 03;29.8).mp3"
];

export interface Song extends SongMetadata {
    source: any; // The require() result
}

export const SONGS: Song[] = RAW_FILENAMES.map(filename => {
    const metadata = parseSongFilename(filename);
    // Find the matching require needed for AV
    // Matches by Title roughly
    let source;
    if (metadata.title === 'Are We Cooked') source = SONG_FILES['Are We Cooked'];
    if (metadata.title === 'Beep Boo Boo Bop') source = SONG_FILES['Beep Boo Boo Bop'];
    if (metadata.title === 'Bop Squad') source = SONG_FILES['Bop Squad'];
    if (metadata.title === 'Chillaxin') source = SONG_FILES['Chillaxin'];

    return {
        ...metadata,
        source
    };
});
