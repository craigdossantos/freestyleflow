import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONTS, SHAPES } from "../constants/theme";
import { useGameStore } from "../store";
import {
  deletePack,
  downloadPack,
  formatBytes,
  getAvailablePacks,
  getPacksStorageUsed,
  PackInfo,
} from "../utils/rhymePacks";

export default function PacksScreen() {
  const router = useRouter();
  const [packs, setPacks] = useState<PackInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [downloadingPack, setDownloadingPack] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const activePacks = useGameStore((state) => state.activePacks);
  const loadFamiliesFromPacks = useGameStore(
    (state) => state.loadFamiliesFromPacks,
  );

  const loadPacks = useCallback(async () => {
    try {
      const availablePacks = await getAvailablePacks();
      setPacks(availablePacks);
      const used = await getPacksStorageUsed();
      setStorageUsed(used);
    } catch (error) {
      console.error("Failed to load packs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPacks();
  }, [loadPacks]);

  const handleDownload = async (pack: PackInfo) => {
    setDownloadingPack(pack.id);
    setDownloadProgress(0);

    try {
      await downloadPack(pack, (progress) => {
        setDownloadProgress(progress);
      });

      // Refresh pack list
      await loadPacks();

      // Auto-activate the downloaded pack
      const newActivePacks = [...activePacks, pack.id];
      await loadFamiliesFromPacks(newActivePacks);

      Alert.alert("Success", `${pack.name} downloaded and activated!`);
    } catch (error) {
      console.error("Download failed:", error);
      Alert.alert(
        "Download Failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setDownloadingPack(null);
      setDownloadProgress(0);
    }
  };

  const handleDelete = async (pack: PackInfo) => {
    Alert.alert(
      "Delete Pack",
      `Are you sure you want to delete ${pack.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePack(pack.id);

              // Remove from active packs if it was active
              if (activePacks.includes(pack.id)) {
                const newActivePacks = activePacks.filter(
                  (id) => id !== pack.id,
                );
                await loadFamiliesFromPacks(
                  newActivePacks.length > 0 ? newActivePacks : ["core"],
                );
              }

              await loadPacks();
            } catch (error) {
              console.error("Delete failed:", error);
              Alert.alert("Error", "Failed to delete pack");
            }
          },
        },
      ],
    );
  };

  const togglePackActive = async (pack: PackInfo) => {
    if (!pack.isDownloaded && !pack.bundled) {
      return; // Can't activate a pack that's not downloaded
    }

    let newActivePacks: string[];
    if (activePacks.includes(pack.id)) {
      // Don't allow deactivating the last pack
      if (activePacks.length <= 1) {
        Alert.alert("Error", "At least one pack must be active");
        return;
      }
      newActivePacks = activePacks.filter((id) => id !== pack.id);
    } else {
      newActivePacks = [...activePacks, pack.id];
    }

    await loadFamiliesFromPacks(newActivePacks);
  };

  const renderPack = (pack: PackInfo) => {
    const isActive = activePacks.includes(pack.id);
    const isDownloading = downloadingPack === pack.id;
    const canDownload = !pack.bundled && !pack.isDownloaded && !isDownloading;
    const canDelete = !pack.bundled && pack.isDownloaded;

    return (
      <View
        key={pack.id}
        style={[styles.packItem, isActive && styles.packItemActive]}
      >
        <TouchableOpacity
          style={styles.packInfo}
          onPress={() => togglePackActive(pack)}
          disabled={!pack.isDownloaded && !pack.bundled}
        >
          <View style={styles.packHeader}>
            <View style={styles.packCheckbox}>
              {(pack.isDownloaded || pack.bundled) && (
                <Text style={styles.checkmark}>{isActive ? "X" : "O"}</Text>
              )}
            </View>
            <View style={styles.packDetails}>
              <Text style={styles.packName}>{pack.name}</Text>
              <Text style={styles.packDescription}>{pack.description}</Text>
              <View style={styles.packMeta}>
                {pack.bundled && <Text style={styles.packBadge}>BUNDLED</Text>}
                {pack.isDownloaded && !pack.bundled && (
                  <Text style={[styles.packBadge, styles.downloadedBadge]}>
                    DOWNLOADED
                  </Text>
                )}
                {pack.size > 0 && (
                  <Text style={styles.packSize}>{formatBytes(pack.size)}</Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.packActions}>
          {isDownloading && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="small" color={COLORS.accent} />
              <Text style={styles.progressText}>
                {Math.round(downloadProgress * 100)}%
              </Text>
            </View>
          )}

          {canDownload && (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownload(pack)}
            >
              <Text style={styles.downloadButtonText}>DOWNLOAD</Text>
            </TouchableOpacity>
          )}

          {canDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(pack)}
            >
              <Text style={styles.deleteButtonText}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>RHYME PACKS</Text>
        <View style={{ width: 70 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading packs...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <Text style={styles.sectionTitle}>AVAILABLE PACKS</Text>
          <Text style={styles.sectionSubtitle}>
            Tap to activate/deactivate. Active packs are used during gameplay.
          </Text>

          {packs.map(renderPack)}

          <View style={styles.storageInfo}>
            <Text style={styles.storageText}>
              Storage used: {formatBytes(storageUsed)}
            </Text>
          </View>

          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>HOW IT WORKS</Text>
            <Text style={styles.helpText}>
              • Core rhymes are bundled with the app{"\n"}• Download additional
              packs for more rhyme variety{"\n"}• Downloaded packs work 100%
              offline{"\n"}• Active packs (marked X) are used during freestyle
              sessions
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: COLORS.text,
    fontFamily: FONTS.main,
    fontSize: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    textAlign: "center",
    fontFamily: FONTS.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.text,
    fontFamily: FONTS.main,
    fontSize: 16,
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: COLORS.text,
    fontFamily: FONTS.main,
    fontSize: 18,
    marginBottom: 5,
  },
  sectionSubtitle: {
    color: COLORS.dimmed,
    fontFamily: FONTS.main,
    fontSize: 12,
    marginBottom: 20,
  },
  packItem: {
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBg,
    marginBottom: 12,
    padding: 15,
    ...SHAPES.rect,
  },
  packItemActive: {
    borderColor: COLORS.accent,
    backgroundColor: "rgba(231, 76, 60, 0.05)",
  },
  packInfo: {
    flex: 1,
  },
  packHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  packCheckbox: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: COLORS.text,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    ...SHAPES.rect,
  },
  checkmark: {
    fontFamily: FONTS.main,
    fontSize: 18,
    color: COLORS.accent,
  },
  packDetails: {
    flex: 1,
  },
  packName: {
    color: COLORS.text,
    fontFamily: FONTS.main,
    fontSize: 16,
    marginBottom: 4,
  },
  packDescription: {
    color: COLORS.dimmed,
    fontFamily: FONTS.main,
    fontSize: 12,
    marginBottom: 8,
  },
  packMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  packBadge: {
    color: COLORS.text,
    fontFamily: FONTS.main,
    fontSize: 10,
    borderWidth: 1,
    borderColor: COLORS.text,
    paddingHorizontal: 6,
    paddingVertical: 2,
    ...SHAPES.rect,
  },
  downloadedBadge: {
    borderColor: COLORS.accent,
    color: COLORS.accent,
  },
  packSize: {
    color: COLORS.dimmed,
    fontFamily: FONTS.main,
    fontSize: 10,
  },
  packActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 10,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressText: {
    color: COLORS.accent,
    fontFamily: FONTS.main,
    fontSize: 12,
  },
  downloadButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...SHAPES.rect,
  },
  downloadButtonText: {
    color: "#FFF",
    fontFamily: FONTS.main,
    fontSize: 12,
  },
  deleteButton: {
    borderWidth: 2,
    borderColor: COLORS.dimmed,
    paddingHorizontal: 10,
    paddingVertical: 6,
    ...SHAPES.rect,
  },
  deleteButtonText: {
    color: COLORS.dimmed,
    fontFamily: FONTS.main,
    fontSize: 12,
  },
  storageInfo: {
    marginTop: 20,
    padding: 15,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    ...SHAPES.rect,
  },
  storageText: {
    color: COLORS.text,
    fontFamily: FONTS.main,
    fontSize: 14,
    textAlign: "center",
  },
  helpSection: {
    marginTop: 20,
    padding: 15,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    ...SHAPES.rect,
  },
  helpTitle: {
    color: COLORS.text,
    fontFamily: FONTS.main,
    fontSize: 14,
    marginBottom: 10,
  },
  helpText: {
    color: COLORS.dimmed,
    fontFamily: FONTS.main,
    fontSize: 12,
    lineHeight: 20,
  },
});
