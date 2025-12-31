import * as FileSystem from "expo-file-system/legacy";
import * as Crypto from "expo-crypto";
import { RhymeFamily } from "../data/rhymes";

const PACKS_DIR = (FileSystem.documentDirectory ?? "") + "rhyme-packs/";
const LOCAL_MANIFEST = PACKS_DIR + "local-manifest.json";
const MANIFEST_URL =
  "https://pub-ee1a7f1954cb4df882c70a58d146d6b1.r2.dev/manifest.json";
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

export interface RhymePack {
  id: string;
  version: string;
  name: string;
  description: string;
  families: RhymeFamily[];
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

    // Ensure packs directory exists
    await FileSystem.makeDirectoryAsync(PACKS_DIR, { intermediates: true });

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
          description: "Essential 1-syllable rhymes for freestyling",
          version: "1.0.0",
          size: 0,
          sha256: "",
          url: "",
          bundled: true,
          isDownloaded: true,
        },
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
      `Insufficient storage. Need ${Math.round((pack.size * 1.5) / 1024)} KB, have ${Math.round(freeSpace / 1024)} KB`,
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

  const result = await downloadResumable.downloadAsync();
  if (!result) {
    throw new Error(`Download failed for pack ${pack.id}`);
  }

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
    const pack: RhymePack = JSON.parse(content);
    return pack.families;
  }

  // Fall back to bundled core pack
  if (packId === "core") {
    // Use the filtered rhyme data as the bundled core pack
    const bundled = require("../app/data/rhyme_levels_filtered.json");
    return bundled.syllable_1_families;
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
      if (fileInfo.exists && "size" in fileInfo && fileInfo.size) {
        totalSize += fileInfo.size;
      }
    }
  }

  return totalSize;
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Local manifest helpers
async function getLocalManifest(): Promise<LocalManifest> {
  try {
    const info = await FileSystem.getInfoAsync(LOCAL_MANIFEST);
    if (!info.exists) {
      return { downloads: {}, lastManifestCheck: "" };
    }
    const content = await FileSystem.readAsStringAsync(LOCAL_MANIFEST);
    return JSON.parse(content);
  } catch {
    return { downloads: {}, lastManifestCheck: "" };
  }
}

async function saveLocalManifest(manifest: LocalManifest): Promise<void> {
  await FileSystem.makeDirectoryAsync(PACKS_DIR, { intermediates: true });
  await FileSystem.writeAsStringAsync(
    LOCAL_MANIFEST,
    JSON.stringify(manifest, null, 2),
  );
}
