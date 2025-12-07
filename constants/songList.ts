// Song metadata and file mappings
// Files renamed to simple names to avoid URL encoding issues with Metro

export interface Song {
    id: string;
    title: string;
    filename: string;
    bpm: number;
    startTime: number; // seconds - when the beat drops
    endTime: number;   // seconds
    source: any;       // The require() result
}

export const SONGS: Song[] = [
    {
        id: 'are_we_cooked',
        title: 'Are We Cooked',
        filename: 'are_we_cooked.mp3',
        bpm: 96,
        startTime: 20.1,
        endTime: 201.0,
        source: require('../music/are_we_cooked.mp3'),
    },
    {
        id: 'beep_boo_boo_bop',
        title: 'Beep Boo Boo Bop',
        filename: 'beep_boo_boo_bop.mp3',
        bpm: 140,
        startTime: 13.9,
        endTime: 181.7,
        source: require('../music/beep_boo_boo_bop.mp3'),
    },
    {
        id: 'bop_squad',
        title: 'Bop Squad',
        filename: 'bop_squad.mp3',
        bpm: 87.5,
        startTime: 11.4,
        endTime: 187.0,
        source: require('../music/bop_squad.mp3'),
    },
    {
        id: 'chillaxin',
        title: 'Chillaxin',
        filename: 'chillaxin.mp3',
        bpm: 91.4,
        startTime: 21.0,
        endTime: 209.8,
        source: require('../music/chillaxin.mp3'),
    },
];
