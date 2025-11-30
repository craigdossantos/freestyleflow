import sqlite3
import json
import os
from collections import Counter

DB_PATH = "rhymes.db"
OUTPUT_PATH = "app/data/rhyme_levels.json"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_words_by_syllable(conn, syllables):
    """Fetch all words with specific syllable count."""
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM words WHERE syllables = ?", (syllables,))
    return [dict(row) for row in cursor.fetchall()]

def get_common_suffix(words):
    """Find the most common suffix (last 2-3 chars) to help label the family."""
    suffixes = [w['word'][-3:] for w in words if len(w['word']) >= 3]
    if not suffixes:
        return ""
    return Counter(suffixes).most_common(1)[0][0]

def analyze_1_syllable_families(conn):
    """Group and rank 1-syllable rhyme families."""
    cursor = conn.cursor()
    
    # Get all 1-syllable words with a rhyme family
    cursor.execute("SELECT * FROM words WHERE syllables = 1 AND rhyme_family IS NOT NULL")
    words = [dict(row) for row in cursor.fetchall()]
    
    # Group by family
    families = {}
    for word in words:
        fam_key = word['rhyme_family']
        if fam_key not in families:
            families[fam_key] = []
        families[fam_key].append(word)
        
    # Rank by size
    ranked_families = []
    for fam_key, fam_words in families.items():
        if len(fam_words) < 5: continue # Skip tiny families
        
        # Find representative word (shortest, most common looking)
        # Heuristic: shortest word is usually the root (e.g., 'cat' vs 'scat')
        fam_words.sort(key=lambda x: len(x['word']))
        rep_word = fam_words[0]['word']
        
        # Find common suffix for label
        suffix = get_common_suffix(fam_words)
        label = f"{rep_word.upper()} Family (-{suffix})"
        
        # Get slant rhymes (placeholder for now, querying DB is expensive for all)
        # We can do a quick query for the top families later if needed
        
        ranked_families.append({
            "family_id": fam_key,
            "label": label,
            "count": len(fam_words),
            "words": [w['word'] for w in fam_words]
        })
        
    # Sort by count descending
    ranked_families.sort(key=lambda x: x['count'], reverse=True)
    return ranked_families

def main():
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} not found!")
        return

    conn = get_db_connection()
    
    print("Analyzing 1-syllable families...")
    families_1 = analyze_1_syllable_families(conn)
    print(f"Found {len(families_1)} common 1-syllable families.")
    
    # For 2 and 3 syllables, we might just want lists for now, 
    # or we can group them too. User asked for "separate lists".
    # Let's just get the raw words for now to keep the file size manageable,
    # or maybe group them if they have families.
    # The user said "lists of words that are one syllable rhymes... two syllable rhymes..."
    # implying grouped rhymes. Let's try to group them too.
    
    # Reusing logic for 2 and 3?
    # Actually, let's just output the structure requested.
    
    output_data = {
        "syllable_1_families": families_1,
        # For 2 and 3, we might not have enough data yet to form good families if scrape isn't done,
        # but let's try.
    }
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(output_data, f, indent=2)
        
    print(f"Saved analysis to {OUTPUT_PATH}")
    conn.close()

if __name__ == "__main__":
    main()
