// Song metadata and file mappings with AI-analyzed beat data
// Beat data imported from JSON files for precise synchronization

// Import beat analysis JSON files
import areWeCookedBeats from "../aibeats/Are We Cooked (96 BPM - 00;20.1 - 03;21.0).json";
import beepBooBooBopBeats from "../aibeats/Beep Boo Boo Bop (140BPM 00;13.9 - 03;01.7).json";
import bopSquadBeats from "../aibeats/Bop Squad (87.5 BPM - 00;11.4 - 03;07.0).json";
import chillaxinBeats from "../aibeats/Chillaxin (91.4 BPM - 00;21.0 - 03;29.8).json";
import getUpBeats from "../aibeats/Get Up (90 BPM - 00;13.4 - 02;11.0).json";
import grittyGrooveBeats from "../aibeats/Gritty Groove (90.8 BPM - 00;11.0 - 02;50.0).json";
import hardHittingBarsBeats from "../aibeats/Hard Hitting Bars (89.9 BPM - 00;11.1 - 02;59.2).json";
import smoothRideBeats from "../aibeats/Smooth Ride (89 BPM - 00;12.0 - 03;04.3).json";
import somethingBoutYouBeats from "../aibeats/Something Bout You (141.6BPM 00;13.8 - 02;49.8).json";
import summersCoolBeats from "../aibeats/Summers Cool (89 BPM- 00;21.7 - 03;25.3).json";
import trapLoopBeats from "../aibeats/Trap Loop (139.9BPM 00;13.7 - 03;26).json";
import whistleWhileUTwerkBeats from "../aibeats/Whistle While U Twerk (172.4BPM 00;11.2 - 02;13.6).json";

export interface Song {
  id: string;
  title: string;
  source: any;
  // Beat data from AI analysis
  bpm: number;
  beats: number[];
  downbeats: Set<number>; // Pre-computed for O(1) lookup
  beatDropTime: number;
  duration: number;
}

export const SONGS: Song[] = [
  {
    id: "are_we_cooked",
    title: "Are We Cooked",
    source: require("../music/are_we_cooked.mp3"),
    bpm: areWeCookedBeats.bpm,
    beats: areWeCookedBeats.beats,
    downbeats: new Set(areWeCookedBeats.downbeats),
    beatDropTime: areWeCookedBeats.beat_drop_time,
    duration: areWeCookedBeats.duration,
  },
  {
    id: "beep_boo_boo_bop",
    title: "Beep Boo Boo Bop",
    source: require("../music/beep_boo_boo_bop.mp3"),
    bpm: beepBooBooBopBeats.bpm,
    beats: beepBooBooBopBeats.beats,
    downbeats: new Set(beepBooBooBopBeats.downbeats),
    beatDropTime: beepBooBooBopBeats.beat_drop_time,
    duration: beepBooBooBopBeats.duration,
  },
  {
    id: "bop_squad",
    title: "Bop Squad",
    source: require("../music/bop_squad.mp3"),
    bpm: bopSquadBeats.bpm,
    beats: bopSquadBeats.beats,
    downbeats: new Set(bopSquadBeats.downbeats),
    beatDropTime: bopSquadBeats.beat_drop_time,
    duration: bopSquadBeats.duration,
  },
  {
    id: "chillaxin",
    title: "Chillaxin",
    source: require("../music/chillaxin.mp3"),
    bpm: chillaxinBeats.bpm,
    beats: chillaxinBeats.beats,
    downbeats: new Set(chillaxinBeats.downbeats),
    beatDropTime: chillaxinBeats.beat_drop_time,
    duration: chillaxinBeats.duration,
  },
  {
    id: "get_up",
    title: "Get Up",
    source: require("../music/get_up.mp3"),
    bpm: getUpBeats.bpm,
    beats: getUpBeats.beats,
    downbeats: new Set(getUpBeats.downbeats),
    beatDropTime: getUpBeats.beat_drop_time,
    duration: getUpBeats.duration,
  },
  {
    id: "gritty_groove",
    title: "Gritty Groove",
    source: require("../music/gritty_groove.mp3"),
    bpm: grittyGrooveBeats.bpm,
    beats: grittyGrooveBeats.beats,
    downbeats: new Set(grittyGrooveBeats.downbeats),
    beatDropTime: grittyGrooveBeats.beat_drop_time,
    duration: grittyGrooveBeats.duration,
  },
  {
    id: "hard_hitting_bars",
    title: "Hard Hitting Bars",
    source: require("../music/hard_hitting_bars.mp3"),
    bpm: hardHittingBarsBeats.bpm,
    beats: hardHittingBarsBeats.beats,
    downbeats: new Set(hardHittingBarsBeats.downbeats),
    beatDropTime: hardHittingBarsBeats.beat_drop_time,
    duration: hardHittingBarsBeats.duration,
  },
  {
    id: "smooth_ride",
    title: "Smooth Ride",
    source: require("../music/smooth_ride.mp3"),
    bpm: smoothRideBeats.bpm,
    beats: smoothRideBeats.beats,
    downbeats: new Set(smoothRideBeats.downbeats),
    beatDropTime: smoothRideBeats.beat_drop_time,
    duration: smoothRideBeats.duration,
  },
  {
    id: "something_bout_you",
    title: "Something Bout You",
    source: require("../music/something_bout_you.mp3"),
    bpm: somethingBoutYouBeats.bpm,
    beats: somethingBoutYouBeats.beats,
    downbeats: new Set(somethingBoutYouBeats.downbeats),
    beatDropTime: somethingBoutYouBeats.beat_drop_time,
    duration: somethingBoutYouBeats.duration,
  },
  {
    id: "summers_cool",
    title: "Summers Cool",
    source: require("../music/summers_cool.mp3"),
    bpm: summersCoolBeats.bpm,
    beats: summersCoolBeats.beats,
    downbeats: new Set(summersCoolBeats.downbeats),
    beatDropTime: summersCoolBeats.beat_drop_time,
    duration: summersCoolBeats.duration,
  },
  {
    id: "trap_loop",
    title: "Trap Loop",
    source: require("../music/trap_loop.mp3"),
    bpm: trapLoopBeats.bpm,
    beats: trapLoopBeats.beats,
    downbeats: new Set(trapLoopBeats.downbeats),
    beatDropTime: trapLoopBeats.beat_drop_time,
    duration: trapLoopBeats.duration,
  },
  {
    id: "whistle_while_u_twerk",
    title: "Whistle While U Twerk",
    source: require("../music/whistle_while_u_twerk.mp3"),
    bpm: whistleWhileUTwerkBeats.bpm,
    beats: whistleWhileUTwerkBeats.beats,
    downbeats: new Set(whistleWhileUTwerkBeats.downbeats),
    beatDropTime: whistleWhileUTwerkBeats.beat_drop_time,
    duration: whistleWhileUTwerkBeats.duration,
  },
];
