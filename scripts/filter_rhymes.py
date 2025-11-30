import json
import os
from wordfreq import zipf_frequency

# Path to the JSON file
DATA_FILE = 'app/data/rhyme_levels.json'

def filter_rhymes():
    print("Loading rhyme data...")
    with open(DATA_FILE, 'r') as f:
        data = json.load(f)

    original_word_count = 0
    final_word_count = 0
    removed_words = []

    # Filter Syllable 1 Families
    new_families = []
    for family in data.get('syllable_1_families', []):
        original_words = family['words']
        original_word_count += len(original_words)
        
        filtered_words = []
        for word in original_words:
            # Check frequency. 3.0 is roughly 1 in a million.
            # "esoteric" is ~2.8. "apple" is ~4.5.
            freq = zipf_frequency(word, 'en')
            if freq >= 3.0:
                filtered_words.append(word)
            else:
                removed_words.append(f"{word} ({freq:.2f})")

        if len(filtered_words) >= 2:
            family['words'] = filtered_words
            family['count'] = len(filtered_words)
            new_families.append(family)
            final_word_count += len(filtered_words)
        else:
            print(f"Removing family {family['family_id']} (too few words after filter)")

    data['syllable_1_families'] = new_families

    print(f"Original Word Count: {original_word_count}")
    print(f"Final Word Count: {final_word_count}")
    print(f"Removed {original_word_count - final_word_count} words.")
    print("Top 20 removed words (sample):")
    print(removed_words[:20])

    print("Saving filtered data...")
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    print("Done!")

if __name__ == "__main__":
    filter_rhymes()
