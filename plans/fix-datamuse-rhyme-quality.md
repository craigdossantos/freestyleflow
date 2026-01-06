# Rhyme Data Comparison: Old Dictionary vs Datamuse

## Final Decision: Use Old Dictionary Only

Remove the Datamuse packs system and revert to the bundled `rhyme_levels_filtered.json` for the game. The old dictionary has 10x more families and is phonetically accurate.

---

## Implementation Checklist

### 1. Revert store.ts to use bundled data

- [ ] Remove `loadedFamilies`, `activePacks`, `isLoadingPacks`, `packsReady` state
- [ ] Remove `loadFamiliesFromPacks()` function
- [ ] Update `loadNewRhymes()` and `shiftBoard()` to use bundled data directly
- [ ] Import `rhyme_levels_filtered.json` directly

### 2. Remove packs UI

- [ ] Delete or hide "RHYME PACKS" button in `app/menu.tsx`
- [ ] Delete `app/packs.tsx` screen (or keep for future)

### 3. Clean up files

- [ ] Delete `utils/rhymePacks.ts` (or keep for future reference)
- [ ] Delete `scripts/generate-packs.ts`
- [ ] Delete `packs/` directory (manifest + pack files)
- [ ] Delete `temp-pack-viewer.html`

### 4. Keep for dictionary

- [ ] Keep `rhyme_levels.json` (full 2.5MB) for dictionary lookups
- [ ] Dictionary screen already uses this file

### 5. Test

- [ ] Verify game uses bundled families correctly
- [ ] Verify dictionary still works
- [ ] Verify mastery tracking still works

---

## Comparison Summary

| Aspect                     | Old Dictionary                        | Datamuse Packs                  |
| -------------------------- | ------------------------------------- | ------------------------------- |
| **1-syl families**         | 310 (filtered) / 505 (full)           | 31                              |
| **Total words**            | 1,994 (filtered) / 21,961 (full)      | 936                             |
| **Syllable accuracy**      | 100% correct                          | Mixed (includes multi-syllable) |
| **Data source**            | B-Rhymes + CMU Pronouncing Dictionary | Datamuse API                    |
| **Phonetic grouping**      | ARPAbet codes (UW1, IY1, EY1)         | Seed word based                 |
| **File size**              | 226KB (filtered) / 2.5MB (full)       | 24KB                            |
| **Slant rhymes**           | Empty (not populated)                 | Poor quality                    |
| **Multi-syllable support** | 2-syl: 1984 fams, 3-syl: 952, 4+: 543 | None                            |

### Quality Examples

**Old Dictionary (phonetically correct):**

```
O Family (-low): go, ho, lo, no, oh, pro, so, bro, crow, foe, flow, glow, grow...
J Family (-ray): bay, day, gay, hay, jay, lay, may, pay, ray, say, way, clay, gray...
```

**Datamuse Pack (mixed quality):**

```
Go rhymes: apropos (3-syl), show, flow, fallow (2-syl), although (2-syl), portfolio (4-syl)...
Can rhymes: man, point man, fancy man, straw man... (phrases, not words)
```

---

## Recommendation: Use the Old Dictionary

The existing bundled dictionary is **significantly better** than Datamuse for the freestyle game:

1. **10x more rhyme families** (310 vs 31)
2. **Phonetically accurate** - uses CMU Pronouncing Dictionary + ARPAbet
3. **Proper syllable separation** - 1-syl words only in 1-syl families
4. **Already bundled** - no download needed, works offline
5. **Multi-syllable ready** - full version has 2, 3, 4+ syllable data

### What Datamuse Could Still Be Useful For

- **Dictionary screen lookups** - "find rhymes for X" on demand
- **Expanding families** - add new words to existing phonetic families
- **Related words** - synonyms, triggers, semantic associations

---

## Options

### Option A: Revert to Old Dictionary Only

- Remove Datamuse packs system entirely
- Use bundled `rhyme_levels_filtered.json` for game
- Keep bundled `rhyme_levels.json` for dictionary lookups
- **Pros:** Simpler, already works, higher quality
- **Cons:** Loses downloadable content feature

### Option B: Hybrid Approach

- Use old dictionary as the **core bundled data**
- Use Datamuse for **on-demand dictionary lookups** only
- Remove downloadable packs feature
- **Pros:** Best of both worlds
- **Cons:** Some wasted work on packs system

### Option C: Fix Datamuse + Keep Packs System

- Keep packs infrastructure for future content
- Fix syllable filtering in generate script
- Use old dictionary as bundled fallback
- **Pros:** Keeps extensibility
- **Cons:** Datamuse quality still limited

---

## Research Summary

### Root Cause Analysis

**What we discovered:**

1. **RhymeZone ≠ Datamuse API** - While Datamuse powers RhymeZone, RhymeZone has **proprietary near-rhyme data** from analyzing poetry/lyrics that is NOT exposed through the public API. From [RhymeZone's help page](https://www.rhymezone.com/help/):

   > "RhymeZone casts a wide net to hunt down 'near rhymes', analyzing poetry and lyrics from several genres as well as the pronunciations of the words themselves."

2. **`rel_nry` is broken/limited** - Datamuse's near-rhyme endpoint returns:
   - Empty results for common words (flow, cat, night, time)
   - Poor quality matches when it does return data (word → wad, weed, wade)
   - Even RhymeZone.com shows "0 near rhymes" for "flow"

3. **No syllable filtering** - Our script fetches rhymes without filtering by syllable count, so "go" returns "portfolio", "aficionado", "archipelago" mixed with "flow", "show", "know"

4. **Perfect rhymes (`rel_rhy`) work well** - This endpoint reliably returns good data, just needs syllable filtering

### Current Script Issues (`scripts/generate-packs.ts`)

```typescript
// Problem 1: No syllable filtering
const results = await fetchDatamuse(`rel_rhy=${word}&max=${max}`);
// Returns: apropos (3 syl), portfolio (4 syl), show (1 syl) - all mixed together

// Problem 2: rel_nry returns bad/empty data
const results = await fetchDatamuse(`rel_nry=${word}&max=30`);
// Returns: [] for most words, or garbage like word → wad, weed

// Problem 3: rel_cns (consonant match) isn't slant rhyming
fetchDatamuse(`rel_cns=${seed}&max=20`);
// Returns: sample → simple (same consonants, not slant rhymes)
```

---

## Recommended Solution

### Approach: Fix Perfect Rhymes + Remove Broken Slant Rhymes

1. **Filter perfect rhymes by syllable count** - Add `md=s` parameter and filter results
2. **Remove slant rhyme pack** - Datamuse can't provide quality slant rhymes
3. **Consider CMU dictionary for future** - [pronouncing](https://pypi.org/project/pronouncing/) Python library can compute real slant rhymes

### Implementation

**File: `scripts/generate-packs.ts`**

```typescript
// Fix 1: Request syllable metadata
const results = await fetchDatamuse(
  `rel_rhy=${encodeURIComponent(word)}&max=${max}&md=s`,
);

// Fix 2: Filter by syllable count
function getSyllableCount(word: string): number {
  // Approximate: count vowel groups
  return (
    word
      .toLowerCase()
      .split(/[^aeiouy]+/)
      .filter(Boolean).length || 1
  );
}

async function getPerfectRhymes(word: string, max = 50): Promise<string[]> {
  const targetSyllables = getSyllableCount(word);
  const results = await fetchDatamuse(
    `rel_rhy=${encodeURIComponent(word)}&max=${max * 2}&md=s`,
  );

  return results
    .filter((r) => r.numSyllables === targetSyllables)
    .slice(0, max)
    .map((r) => r.word);
}

// Fix 3: Remove slant rhyme generation entirely
// The generateSlantPack() function should be removed or replaced with:
// - Curated slant rhymes from a JSON file
// - Or integration with CMU Pronouncing Dictionary via Node
```

### Files to Modify

1. **`scripts/generate-packs.ts`** - Add syllable filtering, remove/fix slant generation
2. **`packs/manifest.json`** - Remove slant-1 pack if we can't fix it
3. **`temp-pack-viewer.html`** - Keep for data inspection

---

## Alternative: CMU Pronouncing Dictionary

If you want quality slant rhymes in the future, the [CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict) can be used:

```python
import pronouncing

# Perfect rhymes - based on matching ending phones
pronouncing.rhymes("climbing")  # ['diming', 'liming', 'priming', 'rhyming', 'timing']

# Get phonetic representation for custom slant detection
pronouncing.phones_for_word("night")  # ['N AY1 T']
```

This would require a Python pre-processing step to generate pack data, but would give much higher quality results than Datamuse.

---

## Summary of What Went Wrong

| Issue                               | Cause                                                | Fix                                         |
| ----------------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| Multi-syllable words in 1-syl packs | No syllable filtering                                | Add `md=s` param + filter by `numSyllables` |
| Bad slant rhymes (word → wad)       | `rel_nry` returns phonetic matches, not slant rhymes | Remove slant pack or use CMU dictionary     |
| Consonant matches aren't rhymes     | `rel_cns` was wrong tool                             | Remove `rel_cns` usage                      |

---

## Implementation Checklist

### 1. Fix `scripts/generate-packs.ts`

- [ ] Add `&md=s` to API calls to get syllable metadata
- [ ] Filter `rel_rhy` results by `numSyllables` matching seed word
- [ ] Remove `generateSlantPack()` function entirely
- [ ] Remove `getNearRhymes()` function
- [ ] Remove `rel_cns` consonant matching
- [ ] Update seed words list (remove redundant words in same family)

### 2. Update `packs/manifest.json`

- [ ] Remove slant-1 pack entry
- [ ] Update lastUpdated date

### 3. Regenerate packs

- [ ] Run `npx ts-node scripts/generate-packs.ts`
- [ ] Verify pack quality in `temp-pack-viewer.html`
- [ ] Upload new packs to Cloudflare R2

### 4. Clean up

- [ ] Delete `packs/slant-1-v1.0.0.json`
- [ ] Update R2 bucket (remove old slant pack)

### 5. App updates

- [ ] Remove slant pack from UI if shown
- [ ] Test download flow with new core pack

---

Sources:

- [Datamuse API](https://www.datamuse.com/api/)
- [RhymeZone Help](https://www.rhymezone.com/help/)
- [pronouncing Python library](https://pypi.org/project/pronouncing/)
- [CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict)
