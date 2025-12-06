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

def analyze_families(conn, syllables, min_syllables=None):
    """Group and rank rhyme families for a specific syllable count (or range)."""
    cursor = conn.cursor()
    
    if min_syllables:
        # For 4+ syllables
        cursor.execute("SELECT * FROM words WHERE syllables >= ? AND rhyme_family IS NOT NULL", (min_syllables,))
    else:
        cursor.execute("SELECT * FROM words WHERE syllables = ? AND rhyme_family IS NOT NULL", (syllables,))
        
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
        if len(fam_words) < 2: continue # Skip singletons
        
        # Find representative word (shortest, most common looking)
        fam_words.sort(key=lambda x: len(x['word']))
        rep_word = fam_words[0]['word']
        
        # Find common suffix for label
        suffix = get_common_suffix(fam_words)
        label = f"{rep_word.upper()} Family"
        if suffix:
            label += f" (-{suffix})"
            
        # Get slant rhymes
        # We want words that rhyme with members of this family but aren't in it.
        # We'll look for words that appear as rhymes for multiple family members.
        family_ids = [w['id'] for w in fam_words]
        family_words_set = set(w['word'] for w in fam_words)
        
        placeholders = ','.join('?' for _ in family_ids)
        query = f'''
            SELECT w.word, COUNT(*) as match_count, MAX(sr.score) as max_score
            FROM scraped_rhymes sr
            JOIN words w ON sr.rhyme_word_id = w.id
            WHERE sr.word_id IN ({placeholders})
            AND w.word NOT IN ({','.join(['?']*len(family_words_set))})
            GROUP BY w.word
            HAVING match_count >= 1
            ORDER BY match_count DESC, max_score DESC
            LIMIT 20
        '''
        
        args = family_ids + list(family_words_set)
        cursor.execute(query, args)
        slant_rows = cursor.fetchall()
        slant_words = [row['word'] for row in slant_rows]
        
        ranked_families.append({
            "family_id": fam_key,
            "label": label,
            "count": len(fam_words),
            "words": [w['word'] for w in fam_words],
            "slant_words": slant_words
        })
        
    # Sort by count descending
    ranked_families.sort(key=lambda x: x['count'], reverse=True)
    return ranked_families

def main():
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} not found!")
        return

    conn = get_db_connection()
    
    output_data = {}
    
    # Analyze 1, 2, 3 syllables
    for i in range(1, 4):
        print(f"Analyzing {i}-syllable families...")
        families = analyze_families(conn, i)
        print(f"Found {len(families)} common {i}-syllable families.")
        output_data[f"syllable_{i}_families"] = families

    # Analyze 4+ syllables
    print("Analyzing 4+ syllable families...")
    families_4plus = analyze_families(conn, None, min_syllables=4)
    print(f"Found {len(families_4plus)} common 4+ syllable families.")
    output_data["syllable_4_plus_families"] = families_4plus
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(output_data, f, indent=2)
        
    print(f"Saved analysis to {OUTPUT_PATH}")
    conn.close()

if __name__ == "__main__":
    main()
