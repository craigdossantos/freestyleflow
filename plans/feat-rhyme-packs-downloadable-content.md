# feat: Rhyme Packs - Downloadable Content Architecture

## Overview

Replace the current bundled rhyme JSON with a downloadable content pack system. Users select which packs to download (1-syllable, 2-syllable, slant rhymes, etc.), and packs are stored permanently on-device for 100% offline use.

**Key insight**: Rhyme data is static. English rhymes don't change. Treating this like dynamic API data is the wrong model. Instead, we use Datamuse as a **data source for generating packs** (run once by us), not as a runtime dependency for users.

**Status**: Post-MVP enhancement. The app is shipped and working. This improves the data source quality using Datamuse's richer rhyme database (slant rhymes, near rhymes, phonetic matches).

## Problem Statement

**Current State (shipped MVP):**

- App works with bundled rhyme JSON
- Only 1-syllable families used in gameplay
- Slant rhymes toggle exists but data is incomplete
- Current data source (b-rhymes.com scrape) has gaps

**Why Datamuse:**

- Better rhyme coverage (slant, near, consonant matches)
- Phonetic matching for creative flows
- Richer data without maintaining our own scraper
- Can expand to themes, synonyms, multi-syllable in future

**Desired State:**

- Use Datamuse as data source (fetched at build time by us)
- Users download packs on-demand, stored permanently
- 100% offline after download
- No API rate limits (we fetch once, serve forever)
- Easy to add new packs without app update

## Proposed Solution

### Architecture: "Fetch Once, Serve Forever"

```
┌─────────────────────────────────────────────────────────────┐
│  BUILD TIME (run by us, once)                               │
│                                                             │
│  Datamuse API ──→ generate-packs.ts ──→ JSON files          │
│                                                             │
│  We fetch all rhyme data, organize into packs, upload       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Upload to CDN
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  HOSTING (Cloudflare R2 - free, zero bandwidth costs)       │
│                                                             │
│  ├── manifest.json                                          │
│  ├── packs/core-v1.0.0.json              (51 KB)           │
│  ├── packs/slant-rhymes-v1.0.0.json      (12 KB)           │
│  ├── packs/syllable-2-v1.0.0.json        (733 KB)          │
│  ├── packs/syllable-3-v1.0.0.json        (386 KB)          │
│  └── packs/syllable-4-plus-v1.0.0.json   (254 KB)          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ User downloads (once per pack)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  APP (expo-file-system)                                     │
│                                                             │
│  documentDirectory/rhyme-packs/                             │
│  ├── local-manifest.json   (tracks what's downloaded)       │
│  ├── core.json             (always present)                 │
│  └── slant-rhymes.json     (user downloaded)                │
│                                                             │
│  Works 100% offline. No API calls during gameplay.          │
└─────────────────────────────────────────────────────────────┘
```

### Why This Works

| Concern     | Solution                                                        |
| ----------- | --------------------------------------------------------------- |
| Rate limits | We hit Datamuse once during build, users never hit it           |
| Offline     | Packs stored in documentDirectory, persists forever             |
| App size    | Bundle only core pack (~51KB), rest is optional download        |
| Scalability | Cloudflare R2 has zero egress fees, infinite scale              |
| Updates     | Upload new pack version, app fetches manifest and offers update |

## Technical Approach

### Pack Structure

Each pack is a self-contained JSON file:

```typescript
// types/rhymePack.ts
interface RhymePack {
  id: string;
  version: string;
  name: string;
  description: string;
  families: RhymeFamily[];
}

// Same interface as current, no migration needed
interface RhymeFamily {
  family_id: string;
  label: string;
  count: number;
  words: string[];
  slant_words?: string[];
}
```

### Proposed Packs

| Pack ID           | Name            | Content                                        | Size    | Bundled? |
| ----------------- | --------------- | ---------------------------------------------- | ------- | -------- |
| `core`            | Core Rhymes     | Top 50 1-syllable + top 30 2-syllable families | ~51 KB  | Yes      |
| `slant-1`         | Slant Rhymes    | Near-rhymes for 1-syllable families            | ~12 KB  | No       |
| `syllable-2-full` | 2-Syllable Full | All 1,984 2-syllable families                  | ~733 KB | No       |
| `syllable-3`      | 3-Syllable      | All 952 3-syllable families                    | ~386 KB | No       |
| `syllable-4-plus` | 4+ Syllable     | All 543 4+ syllable families                   | ~254 KB | No       |

**Total if user downloads everything: ~1.4 MB** (vs 2.5MB currently bundled)

### Manifest Structure

```json
{
  "version": 1,
  "lastUpdated": "2025-01-30",
  "packs": [
    {
      "id": "core",
      "name": "Core Rhymes",
      "description": "Essential 1 and 2 syllable rhymes for everyday freestyling",
      "version": "1.0.0",
      "size": 52000,
      "sha256": "abc123...",
      "url": "https://cdn.freestyleflow.app/packs/core-v1.0.0.json",
      "bundled": true
    },
    {
      "id": "slant-1",
      "name": "Slant Rhymes",
      "description": "Near-rhymes and imperfect matches for creative flows",
      "version": "1.0.0",
      "size": 12000,
      "sha256": "def456...",
      "url": "https://cdn.freestyleflow.app/packs/slant-1-v1.0.0.json",
      "bundled": false
    }
  ]
}
```

### Local Manifest (tracks downloads with versions)

```json
{
  "downloads": {
    "slant-1": {
      "version": "1.0.0",
      "downloadedAt": "2025-01-30T10:00:00Z",
      "size": 12000
    }
  },
  "lastManifestCheck": "2025-01-30T10:00:00Z"
}
```

### Key Files to Create/Modify

| File                                        | Purpose                                                   |
| ------------------------------------------- | --------------------------------------------------------- |
| NEW: `scripts/generate-packs.ts`            | Fetch from Datamuse, generate pack JSON files             |
| NEW: `utils/rhymePacks.ts`                  | Download, load, delete packs (~80 lines)                  |
| NEW: `app/packs.tsx`                        | UI for browsing/downloading packs                         |
| MODIFY: `store.ts`                          | Load rhymes from downloaded packs instead of bundled JSON |
| MODIFY: `app/settings.tsx`                  | Add link to pack management                               |
| DELETE: `app/data/rhyme_levels.json`        | Replace with pack system                                  |
| KEEP: `app/data/rhyme_levels_filtered.json` | Becomes bundled "core" pack                               |

### Implementation

#### utils/rhymePacks.ts

```typescript
import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";

const PACKS_DIR = FileSystem.documentDirectory + "rhyme-packs/";
const LOCAL_MANIFEST = PACKS_DIR + "local-manifest.json";
const MANIFEST_URL = "https://cdn.freestyleflow.app/manifest.json";
const MANIFEST_TIMEOUT_MS = 5000;

export interface PackInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  size: number;
  sha256: string;
  url: string;
  bundled: boolean;
  isDownloaded?: boolean;
  downloadProgress?: number;
}

interface LocalManifest {
  downloads: Record<
    string,
    { version: string; downloadedAt: string; size: number }
  >;
  lastManifestCheck: string;
}

// Fetch manifest with timeout, fallback to cached
export async function getAvailablePacks(): Promise<PackInfo[]> {
  let manifest;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MANIFEST_TIMEOUT_MS);

    const response = await fetch(MANIFEST_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    manifest = await response.json();

    // Cache manifest for offline use
    await FileSystem.writeAsStringAsync(
      PACKS_DIR + "cached-manifest.json",
      JSON.stringify(manifest),
    );
  } catch (error) {
    // Fallback to cached manifest
    const cached = await FileSystem.getInfoAsync(
      PACKS_DIR + "cached-manifest.json",
    );
    if (cached.exists) {
      const content = await FileSystem.readAsStringAsync(
        PACKS_DIR + "cached-manifest.json",
      );
      manifest = JSON.parse(content);
    } else {
      // Return only bundled core pack if no network and no cache
      return [
        {
          id: "core",
          name: "Core Rhymes",
          bundled: true,
          isDownloaded: true,
        } as PackInfo,
      ];
    }
  }

  const localManifest = await getLocalManifest();

  const packsWithStatus = manifest.packs.map((pack: PackInfo) => {
    const downloaded = localManifest.downloads[pack.id];
    const isDownloaded = pack.bundled || downloaded?.version === pack.version;
    return { ...pack, isDownloaded };
  });

  return packsWithStatus;
}

// Download pack with integrity verification and atomic write
export async function downloadPack(
  pack: PackInfo,
  onProgress?: (progress: number) => void,
): Promise<void> {
  await FileSystem.makeDirectoryAsync(PACKS_DIR, { intermediates: true });

  // Check disk space (require 1.5x buffer)
  const freeSpace = await FileSystem.getFreeDiskStorageAsync();
  if (freeSpace < pack.size * 1.5) {
    throw new Error(
      `Insufficient storage. Need ${pack.size * 1.5} bytes, have ${freeSpace}`,
    );
  }

  // Download to temp file first (atomic write pattern)
  const tempPath = PACKS_DIR + `${pack.id}.tmp`;
  const finalPath = PACKS_DIR + `${pack.id}.json`;

  const downloadResumable = FileSystem.createDownloadResumable(
    pack.url,
    tempPath,
    {},
    (downloadProgress) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      onProgress?.(progress);
    },
  );

  await downloadResumable.downloadAsync();

  // Verify integrity
  const content = await FileSystem.readAsStringAsync(tempPath);
  const actualHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    content,
  );

  if (actualHash !== pack.sha256) {
    await FileSystem.deleteAsync(tempPath, { idempotent: true });
    throw new Error(`Pack integrity check failed for ${pack.id}`);
  }

  // Validate JSON is parseable
  try {
    JSON.parse(content);
  } catch {
    await FileSystem.deleteAsync(tempPath, { idempotent: true });
    throw new Error(`Pack ${pack.id} contains invalid JSON`);
  }

  // Atomic move to final location
  await FileSystem.moveAsync({ from: tempPath, to: finalPath });

  // Update local manifest
  const localManifest = await getLocalManifest();
  localManifest.downloads[pack.id] = {
    version: pack.version,
    downloadedAt: new Date().toISOString(),
    size: pack.size,
  };
  await saveLocalManifest(localManifest);
}

// Load a pack's rhyme families
export async function loadPack(packId: string): Promise<RhymeFamily[]> {
  // Check downloaded packs first
  const path = PACKS_DIR + `${packId}.json`;
  const info = await FileSystem.getInfoAsync(path);

  if (info.exists) {
    const content = await FileSystem.readAsStringAsync(path);
    const pack = JSON.parse(content);
    return pack.families;
  }

  // Fall back to bundled core pack
  if (packId === "core") {
    const bundled = require("../app/data/core-pack.json");
    return bundled.families;
  }

  return [];
}

// Check if pack exists and is current version
export async function isPackDownloaded(packId: string): Promise<boolean> {
  const path = PACKS_DIR + `${packId}.json`;
  const info = await FileSystem.getInfoAsync(path);
  return info.exists;
}

// Delete a pack
export async function deletePack(packId: string): Promise<void> {
  if (packId === "core") return; // Can't delete bundled pack
  await FileSystem.deleteAsync(PACKS_DIR + `${packId}.json`, {
    idempotent: true,
  });

  // Update local manifest
  const localManifest = await getLocalManifest();
  delete localManifest.downloads[packId];
  await saveLocalManifest(localManifest);
}

// Get total storage used by packs (correct implementation)
export async function getPacksStorageUsed(): Promise<number> {
  const info = await FileSystem.getInfoAsync(PACKS_DIR);
  if (!info.exists) return 0;

  const files = await FileSystem.readDirectoryAsync(PACKS_DIR);
  let totalSize = 0;

  for (const file of files) {
    if (file.endsWith(".json") && !file.includes("manifest")) {
      const fileInfo = await FileSystem.getInfoAsync(PACKS_DIR + file);
      if (fileInfo.exists && fileInfo.size) {
        totalSize += fileInfo.size;
      }
    }
  }

  return totalSize;
}

// Local manifest helpers
async function getLocalManifest(): Promise<LocalManifest> {
  const info = await FileSystem.getInfoAsync(LOCAL_MANIFEST);
  if (!info.exists) {
    return { downloads: {}, lastManifestCheck: "" };
  }
  const content = await FileSystem.readAsStringAsync(LOCAL_MANIFEST);
  return JSON.parse(content);
}

async function saveLocalManifest(manifest: LocalManifest): Promise<void> {
  await FileSystem.writeAsStringAsync(LOCAL_MANIFEST, JSON.stringify(manifest));
}
```

#### store.ts Changes

```typescript
// Before: Static import
// import rhymeDataRaw from "./app/data/rhyme_levels_filtered.json";
// const ALL_FAMILIES = rhymeData.syllable_1_families;

// After: Dynamic loading from packs
interface GameState {
  // ... existing state ...
  loadedFamilies: RhymeFamily[];
  activePacks: string[];
  isLoadingPacks: boolean;
  packsReady: boolean;  // Guard for loadNewRhymes
}

// Track load operations to prevent race conditions
let loadId = 0;

// Load families from selected packs (parallel loading)
loadFamiliesFromPacks: async (packIds: string[]) => {
  const thisLoadId = ++loadId;
  set({ isLoadingPacks: true, packsReady: false });

  // Load all packs in parallel
  const familyArrays = await Promise.all(packIds.map(loadPack));

  // Check if another load was started while we were waiting
  if (thisLoadId !== loadId) return;

  const allFamilies = familyArrays.flat();

  set({
    loadedFamilies: allFamilies,
    activePacks: packIds,
    isLoadingPacks: false,
    packsReady: true
  });
},

// Guard in loadNewRhymes to prevent calling before packs are ready
loadNewRhymes: (rowIndex?: number) => {
  const state = get();

  // Guard: don't try to load rhymes if packs aren't ready yet
  if (!state.packsReady || state.loadedFamilies.length === 0) {
    console.warn('[Store] loadNewRhymes called before packs loaded');
    return;
  }

  set((state) => {
    // Same logic as before, but uses state.loadedFamilies instead of ALL_FAMILIES
    const family = state.loadedFamilies[Math.floor(Math.random() * state.loadedFamilies.length)];
    // ... rest of existing logic unchanged
  });
},
```

**Important**: Ensure packs are loaded before mounting game screen:

```typescript
// In game screen or app initialization
useEffect(() => {
  const initPacks = async () => {
    await loadFamiliesFromPacks(['core']); // Load default pack
  };
  initPacks();
}, []);

// Only render game when packs are ready
if (!packsReady) {
  return <LoadingSpinner />;
}
```

#### scripts/generate-packs.ts

```typescript
// Run locally to generate pack JSON files from Datamuse
// Usage: npx ts-node scripts/generate-packs.ts

const DATAMUSE_URL = 'https://api.datamuse.com/words';

async function generateCorePack() {
  const families: RhymeFamily[] = [];

  // Fetch rhymes for common seed words
  const seedWords = ['go', 'flow', 'day', 'way', 'me', 'see', ...]; // Top 80 words

  for (const seed of seedWords) {
    const [perfect, near] = await Promise.all([
      fetch(`${DATAMUSE_URL}?rel_rhy=${seed}&max=50`).then(r => r.json()),
      fetch(`${DATAMUSE_URL}?rel_nry=${seed}&max=30`).then(r => r.json()),
    ]);

    families.push({
      family_id: `seed_${seed}`,
      label: `${seed} rhymes`,
      count: perfect.length,
      words: perfect.map(w => w.word),
      slant_words: near.map(w => w.word),
    });

    // Respect rate limits
    await sleep(100);
  }

  const pack = {
    id: 'core',
    version: '1.0.0',
    name: 'Core Rhymes',
    description: 'Essential rhymes for everyday freestyling',
    families,
  };

  fs.writeFileSync('packs/core-v1.0.0.json', JSON.stringify(pack));
}
```

## User Experience

### Pack Selection Screen (`app/packs.tsx`)

```
┌─────────────────────────────────────────┐
│  Rhyme Packs                       ✕    │
├─────────────────────────────────────────┤
│                                         │
│  ✓ Core Rhymes               Bundled    │
│    Essential 1-2 syllable (51 KB)       │
│                                         │
│  ────────────────────────────────────   │
│                                         │
│  ○ Slant Rhymes              [Download] │
│    Near-rhymes for creative flows       │
│    12 KB                                │
│                                         │
│  ○ 2-Syllable Full           [Download] │
│    All 1,984 families                   │
│    733 KB                               │
│                                         │
│  ○ 3-Syllable                [Download] │
│    952 families for advanced flows      │
│    386 KB                               │
│                                         │
│  ────────────────────────────────────   │
│  Storage used: 51 KB / 1.4 MB total     │
│                                         │
└─────────────────────────────────────────┘
```

### Game Mode Selection

When starting a game, user can select which packs to use:

```
┌─────────────────────────────────────────┐
│  Select Rhyme Mode                      │
├─────────────────────────────────────────┤
│                                         │
│  [✓] Core Rhymes                        │
│  [✓] Slant Rhymes                       │
│  [ ] 2-Syllable (not downloaded)        │
│                                         │
│  ─────────────────────────────────────  │
│  Rhyme Scheme: [AABB ▼]                 │
│                                         │
│           [Start Freestyle]             │
│                                         │
└─────────────────────────────────────────┘
```

## Acceptance Criteria

- [ ] Core pack (~51KB) bundled with app, works offline immediately
- [ ] Users can browse available packs in settings
- [ ] Users can download packs with progress indicator
- [ ] Downloaded packs persist across app restarts
- [ ] Users can delete downloaded packs to free storage
- [ ] Game loads rhymes from selected packs
- [ ] Slant rhymes toggle works when slant pack is downloaded
- [ ] App shows storage used by packs
- [ ] Manifest check for pack updates (silent, non-blocking)

## Hosting Setup (Cloudflare R2)

**Why R2:**

- 10GB free storage (plenty for JSON packs)
- **Zero egress fees** - unlimited downloads at no cost
- Global CDN built-in
- S3-compatible API for easy uploads

**Setup:**

1. Create Cloudflare account (free)
2. Create R2 bucket: `freestyleflow-packs`
3. Enable public access
4. Upload packs via wrangler CLI or dashboard
5. Custom domain optional: `cdn.freestyleflow.app`

**Upload command:**

```bash
npx wrangler r2 object put freestyleflow-packs/manifest.json --file=./packs/manifest.json
npx wrangler r2 object put freestyleflow-packs/packs/core-v1.0.0.json --file=./packs/core.json
```

## Migration Path

1. **Phase 1**: Generate packs from current data + Datamuse enhancement
2. **Phase 2**: Add pack download UI to settings
3. **Phase 3**: Update store.ts to load from packs
4. **Phase 4**: Remove old bundled JSON, ship core pack only
5. **Phase 5**: Upload to R2, enable remote manifest

**Backwards compatible**: Existing users get core pack (same as current filtered data). New features (slant rhymes, multi-syllable) require downloading packs.

## Success Metrics

| Metric                        | Before              | After            |
| ----------------------------- | ------------------- | ---------------- |
| App bundle size (rhyme data)  | 2.5 MB              | 51 KB            |
| Offline capability            | 100%                | 100%             |
| API rate limit concerns       | 580 DAU max         | Unlimited        |
| Slant rhyme support           | Partial             | Full (with pack) |
| Multi-syllable support        | Data exists, unused | User-selectable  |
| Network calls during gameplay | Potentially many    | Zero             |

## Dependencies

**New:**

- `expo-file-system` (likely already installed)
- `expo-crypto` (for SHA256 integrity verification)

**Removed:**

- No TanStack Query needed
- No MMKV needed
- No NetInfo needed (packs work offline)

**Infrastructure:**

- Cloudflare R2 (free tier sufficient)

## Robustness Features (from code review)

The implementation includes these critical safeguards:

| Feature                           | Purpose                                                 |
| --------------------------------- | ------------------------------------------------------- |
| **SHA256 integrity verification** | Detect corrupted downloads before they break gameplay   |
| **Atomic writes**                 | Download to `.tmp`, verify, then move to final location |
| **Manifest fetch timeout**        | 5s timeout with fallback to cached manifest             |
| **Disk space check**              | Verify 1.5x required space before download              |
| **Race condition guards**         | Prevent `loadNewRhymes` before packs loaded             |
| **Load ID tracking**              | Cancel stale pack loads if user changes selection       |
| **Parallel pack loading**         | `Promise.all` for faster multi-pack loads               |
| **Version tracking**              | Local manifest tracks which version is downloaded       |
| **Graceful offline fallback**     | Returns bundled core pack if no network and no cache    |

## Risks & Mitigations

| Risk                     | Mitigation                                       |
| ------------------------ | ------------------------------------------------ |
| CDN goes down            | Core pack bundled, app works without network     |
| Pack download fails      | Retry button, partial download resume            |
| User runs out of storage | Show storage used, allow deleting packs          |
| Pack data is wrong       | Version in filename, can push fix as new version |

## Future Enhancements

1. **Themed packs**: "Battle Rap Pack", "Love Songs Pack" with curated families
2. **User-created packs**: Let users save custom family selections
3. **Pack bundles**: "Download All" option
4. **Background downloads**: Download packs while app is idle
5. **Pack ratings**: Let users rate which packs are most useful

---

## References

- [Expo FileSystem Documentation](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/) (zero egress!)
- [Datamuse API](https://www.datamuse.com/api/)
- Previous plan: `plans/feat-datamuse-api-integration.md`

---

Generated with [Claude Code](https://claude.ai/claude-code) - 2025-01-30
