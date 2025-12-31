/**
 * Generate Rhyme Packs from Datamuse API
 *
 * This script fetches rhyme data from Datamuse and generates pack JSON files
 * for the FreestyleFlow app. Run this script to update pack contents.
 *
 * Usage: npx ts-node scripts/generate-packs.ts
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATAMUSE_URL = "https://api.datamuse.com/words";
const OUTPUT_DIR = path.join(__dirname, "..", "packs");

interface DatamuseWord {
  word: string;
  score: number;
  numSyllables?: number;
}

interface RhymeFamily {
  family_id: string;
  label: string;
  count: number;
  words: string[];
  slant_words?: string[];
}

interface RhymePack {
  id: string;
  version: string;
  name: string;
  description: string;
  families: RhymeFamily[];
}

interface ManifestPack {
  id: string;
  name: string;
  description: string;
  version: string;
  size: number;
  sha256: string;
  url: string;
  bundled: boolean;
}

interface Manifest {
  version: number;
  lastUpdated: string;
  packs: ManifestPack[];
}

// Sleep helper for rate limiting
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch from Datamuse with error handling
async function fetchDatamuse(params: string): Promise<DatamuseWord[]> {
  try {
    const response = await fetch(`${DATAMUSE_URL}?${params}`);
    if (!response.ok) {
      console.error(`Datamuse error: ${response.status}`);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error(`Fetch error: ${error}`);
    return [];
  }
}

// Get perfect rhymes for a word
async function getPerfectRhymes(word: string, max = 50): Promise<string[]> {
  const results = await fetchDatamuse(
    `rel_rhy=${encodeURIComponent(word)}&max=${max}`,
  );
  return results.map((r) => r.word);
}

// Get near rhymes (slant rhymes) for a word
async function getNearRhymes(word: string, max = 30): Promise<string[]> {
  const results = await fetchDatamuse(
    `rel_nry=${encodeURIComponent(word)}&max=${max}`,
  );
  return results.map((r) => r.word);
}

// Common 1-syllable seed words for the core pack
const CORE_SEED_WORDS = [
  // Most common rhyme endings
  "go",
  "flow",
  "know",
  "show",
  "grow",
  "day",
  "way",
  "say",
  "play",
  "stay",
  "me",
  "be",
  "see",
  "free",
  "tree",
  "time",
  "rhyme",
  "climb",
  "prime",
  "crime",
  "night",
  "right",
  "fight",
  "light",
  "might",
  "man",
  "can",
  "plan",
  "fan",
  "ran",
  "back",
  "track",
  "black",
  "stack",
  "crack",
  "mind",
  "find",
  "kind",
  "blind",
  "grind",
  "life",
  "knife",
  "wife",
  "strife",
  "world",
  "girl",
  "pearl",
  "swirl",
  "love",
  "above",
  "dove",
  "shove",
  "real",
  "deal",
  "feel",
  "steal",
  "wheel",
  "hot",
  "got",
  "shot",
  "lot",
  "spot",
  "face",
  "place",
  "space",
  "race",
  "chase",
  "soul",
  "role",
  "goal",
  "whole",
  "control",
  "beat",
  "heat",
  "street",
  "sweet",
  "feet",
  "game",
  "name",
  "fame",
  "flame",
  "same",
  "cash",
  "flash",
  "clash",
  "dash",
  "trash",
  "loud",
  "proud",
  "cloud",
  "crowd",
  "fire",
  "higher",
  "wire",
  "desire",
];

// Additional 1-syllable words for slant rhyme pack
const SLANT_SEED_WORDS = [
  "word",
  "bird",
  "heard",
  "third",
  "green",
  "scene",
  "mean",
  "dream",
  "thing",
  "king",
  "ring",
  "bring",
  "work",
  "jerk",
  "lurk",
  "talk",
  "walk",
  "chalk",
  "hold",
  "gold",
  "cold",
  "told",
  "live",
  "give",
  "forgive",
  "hard",
  "card",
  "guard",
  "yard",
];

async function generateCorePack(): Promise<RhymePack> {
  console.log("Generating Core Pack...");
  const families: RhymeFamily[] = [];
  const seenWords = new Set<string>();

  for (let i = 0; i < CORE_SEED_WORDS.length; i++) {
    const seed = CORE_SEED_WORDS[i];
    console.log(
      `  Fetching rhymes for "${seed}" (${i + 1}/${CORE_SEED_WORDS.length})`,
    );

    const [perfectRhymes, nearRhymes] = await Promise.all([
      getPerfectRhymes(seed, 40),
      getNearRhymes(seed, 20),
    ]);

    // Filter out already-seen words to avoid duplicates across families
    const uniquePerfect = perfectRhymes.filter((w) => !seenWords.has(w));
    const uniqueNear = nearRhymes.filter(
      (w) => !seenWords.has(w) && !uniquePerfect.includes(w),
    );

    if (uniquePerfect.length >= 5) {
      // Add words to seen set
      uniquePerfect.forEach((w) => seenWords.add(w));
      uniqueNear.forEach((w) => seenWords.add(w));

      families.push({
        family_id: `core_${seed}`,
        label: `${seed.charAt(0).toUpperCase() + seed.slice(1)} rhymes`,
        count: uniquePerfect.length,
        words: uniquePerfect,
        slant_words: uniqueNear.length > 0 ? uniqueNear : undefined,
      });
    }

    // Rate limiting: 100ms between requests
    await sleep(100);
  }

  return {
    id: "core",
    version: "1.0.0",
    name: "Core Rhymes",
    description: "Essential 1-syllable rhymes for everyday freestyling",
    families,
  };
}

async function generateSlantPack(): Promise<RhymePack> {
  console.log("Generating Slant Rhymes Pack...");
  const families: RhymeFamily[] = [];

  for (let i = 0; i < SLANT_SEED_WORDS.length; i++) {
    const seed = SLANT_SEED_WORDS[i];
    console.log(
      `  Fetching slant rhymes for "${seed}" (${i + 1}/${SLANT_SEED_WORDS.length})`,
    );

    const [nearRhymes, consonantRhymes] = await Promise.all([
      fetchDatamuse(`rel_nry=${encodeURIComponent(seed)}&max=30`),
      fetchDatamuse(`rel_cns=${encodeURIComponent(seed)}&max=20`),
    ]);

    const nearWords = nearRhymes.map((r) => r.word);
    const consonantWords = consonantRhymes
      .map((r) => r.word)
      .filter((w) => !nearWords.includes(w));
    const allSlant = [...nearWords, ...consonantWords];

    if (allSlant.length >= 5) {
      families.push({
        family_id: `slant_${seed}`,
        label: `${seed.charAt(0).toUpperCase() + seed.slice(1)} slant rhymes`,
        count: allSlant.length,
        words: allSlant.slice(0, 25), // Limit to 25 per family
        slant_words: allSlant.slice(25),
      });
    }

    await sleep(100);
  }

  return {
    id: "slant-1",
    version: "1.0.0",
    name: "Slant Rhymes",
    description: "Near-rhymes and imperfect matches for creative flows",
    families,
  };
}

// Generate SHA256 hash of a string
function generateHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function main() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("Starting pack generation from Datamuse API...\n");

  // Generate packs
  const corePack = await generateCorePack();
  const slantPack = await generateSlantPack();

  // Write pack files
  const manifestPacks: ManifestPack[] = [];
  const baseUrl = "https://cdn.freestyleflow.app/packs";

  for (const pack of [corePack, slantPack]) {
    const content = JSON.stringify(pack, null, 2);
    const filename = `${pack.id}-v${pack.version}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(filepath, content);
    console.log(`\nWrote ${filepath} (${content.length} bytes)`);

    manifestPacks.push({
      id: pack.id,
      name: pack.name,
      description: pack.description,
      version: pack.version,
      size: content.length,
      sha256: generateHash(content),
      url: `${baseUrl}/${filename}`,
      bundled: pack.id === "core",
    });
  }

  // Create manifest
  const manifest: Manifest = {
    version: 1,
    lastUpdated: new Date().toISOString().split("T")[0],
    packs: manifestPacks,
  };

  const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nWrote ${manifestPath}`);

  console.log("\n=== Generation Complete ===");
  console.log(`Core Pack: ${corePack.families.length} families`);
  console.log(`Slant Pack: ${slantPack.families.length} families`);
  console.log(`\nNext steps:`);
  console.log(`1. Upload packs/ folder to CDN`);
  console.log(`2. Update MANIFEST_URL in utils/rhymePacks.ts`);
}

main().catch(console.error);
