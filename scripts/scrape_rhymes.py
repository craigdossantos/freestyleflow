import requests
from bs4 import BeautifulSoup
import sqlite3
import time
import sys
import os
import re
import syllapy
import pronouncing

import random

# Configuration
BASE_URL = "http://www.b-rhymes.com"
DB_PATH = "rhymes.db"
MIN_DELAY = 0.1
MAX_DELAY = 0.3
LONG_PAUSE_EVERY = 500
LONG_PAUSE_DURATION = 5

def setup_database():
    """Initialize the SQLite database with the required schema."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Words table
    # Added details_scraped to track progress
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT UNIQUE NOT NULL,
        syllables INTEGER,
        pronunciation TEXT,
        phonemes TEXT,
        rhyme_family TEXT,
        details_scraped BOOLEAN DEFAULT 0
    )
    ''')
    
    # Ensure details_scraped column exists (migration for existing db)
    try:
        cursor.execute("ALTER TABLE words ADD COLUMN details_scraped BOOLEAN DEFAULT 0")
    except sqlite3.OperationalError:
        pass # Column likely exists
    
    # Rhyme Families table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS rhyme_families (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        family_key TEXT UNIQUE NOT NULL,
        count INTEGER DEFAULT 0,
        example_words TEXT
    )
    ''')
    
    # Scraped Rhymes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS scraped_rhymes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER,
        rhyme_word_id INTEGER,
        score INTEGER,
        is_perfect BOOLEAN,
        FOREIGN KEY(word_id) REFERENCES words(id),
        FOREIGN KEY(rhyme_word_id) REFERENCES words(id)
    )
    ''')
    
    conn.commit()
    return conn

def polite_sleep(request_count):
    """Sleep for a random time, with occasional long pauses."""
    time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))
    if request_count > 0 and request_count % LONG_PAUSE_EVERY == 0:
        print(f"Taking a long pause for {LONG_PAUSE_DURATION}s...")
        time.sleep(LONG_PAUSE_DURATION)

def get_soup(url, request_count=0):
    """Helper to fetch a URL and return BeautifulSoup object."""
    try:
        polite_sleep(request_count)
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; RhymeScraper/1.0)'})
        
        # Handle 404 specifically to avoid noise
        if response.status_code == 404:
            print(f"404 Not Found: {url} (Skipping)")
            return None
            
        response.raise_for_status()
        return BeautifulSoup(response.content, 'html.parser')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def get_rhyme_family(word):
    """
    Determine the rhyme family for a word using CMU Pronouncing Dictionary.
    For 1-syllable words, this is usually the vowel + final consonant(s).
    """
    phones_list = pronouncing.phones_for_word(word)
    if not phones_list:
        return None
    
    # Use the first pronunciation
    phones = phones_list[0]
    
    # Extract the rhyming part (nucleus + coda)
    # pronouncing.rhyming_part() does exactly this
    return pronouncing.rhyming_part(phones)

def process_word(conn, word_text):
    """
    Process a single word:
    1. Insert into 'words' table if not exists.
    2. Calculate syllables and rhyme family.
    """
    cursor = conn.cursor()
    word_text = word_text.lower().strip()
    
    # Check if already exists
    cursor.execute("SELECT id FROM words WHERE word = ?", (word_text,))
    row = cursor.fetchone()
    if row:
        return row[0]
    
    # Calculate metadata
    syllables = syllapy.count(word_text)
    
    # Try to get phonemes from CMU dict
    phonemes_list = pronouncing.phones_for_word(word_text)
    phonemes = phonemes_list[0] if phonemes_list else None
    rhyme_family = get_rhyme_family(word_text)
    
    cursor.execute('''
    INSERT INTO words (word, syllables, phonemes, rhyme_family)
    VALUES (?, ?, ?, ?)
    ''', (word_text, syllables, phonemes, rhyme_family))
    
    conn.commit()
    return cursor.lastrowid

def scrape_word_details(conn, word_id, word_text, request_count):
    """
    Visit the specific word page to get near rhymes, pronunciation, and score.
    """
    url = f"{BASE_URL}/rhyme/word/{word_text}"
    soup = get_soup(url, request_count)
    
    cursor = conn.cursor()
    
    # Always mark as scraped to prevent infinite retries on 404s or bad pages
    # We do this at the start or end, but doing it here ensures we don't get stuck.
    cursor.execute("UPDATE words SET details_scraped = 1 WHERE id = ?", (word_id,))
    conn.commit()
    
    if not soup:
        return False

    # ... (Parsing logic) ...
    tables = soup.find_all('table')
    found_data = False
    
    for table in tables:
        rows = table.find_all('tr')
        if not rows: continue
        
        headers = [th.get_text(strip=True).lower() for th in rows[0].find_all('th')]
        
        if 'word' in headers or 'rhyme' in headers or 'score' in headers:
            found_data = True
            try:
                word_idx = -1
                score_idx = -1
                pron_idx = -1
                
                for i, h in enumerate(headers):
                    if 'word' in h or 'rhyme' in h: word_idx = i
                    elif 'score' in h: score_idx = i
                    elif 'pronunciation' in h: pron_idx = i
                
                if word_idx == -1: continue
                
                for row in rows[1:]:
                    cols = row.find_all('td')
                    if not cols: continue
                    
                    rhyme_word_text = cols[word_idx].get_text(strip=True)
                    
                    score = 0
                    if score_idx != -1 and len(cols) > score_idx:
                        try:
                            score = int(cols[score_idx].get_text(strip=True))
                        except:
                            pass
                            
                    pronunciation = ""
                    if pron_idx != -1 and len(cols) > pron_idx:
                        pronunciation = cols[pron_idx].get_text(strip=True)
                    
                    rhyme_word_id = process_word(conn, rhyme_word_text)
                    
                    if pronunciation:
                        cursor.execute("UPDATE words SET pronunciation = ? WHERE id = ?", (pronunciation, rhyme_word_id))
                    
                    cursor.execute("SELECT id FROM scraped_rhymes WHERE word_id = ? AND rhyme_word_id = ?", (word_id, rhyme_word_id))
                    if not cursor.fetchone():
                        cursor.execute('''
                        INSERT INTO scraped_rhymes (word_id, rhyme_word_id, score, is_perfect)
                        VALUES (?, ?, ?, ?)
                        ''', (word_id, rhyme_word_id, score, False))
                        
                conn.commit()
            except Exception as e:
                print(f"Error parsing table for {word_text}: {e}")
    
    return True

def scrape_index_letter(conn, letter):
    """Scrape all words for a given letter (Index only)."""
    page = 1
    request_count = 0
    while True:
        url = f"{BASE_URL}/rhyme/index/{letter}/{page}" if page > 1 else f"{BASE_URL}/rhyme/index/{letter}"
        print(f"Scraping Index {letter} Page {page}...")
        
        soup = get_soup(url, request_count)
        request_count += 1
        if not soup:
            break
            
        links = soup.find_all('a', href=re.compile(r'/rhyme/word/'))
        if not links:
            print(f"No words found on page {page} for letter {letter}. Stopping.")
            break
            
        for link in links:
            word_text = link.get_text(strip=True)
            if not word_text: continue
            process_word(conn, word_text)
            
        next_link = soup.find('a', string=re.compile(r'Next')) # Use string instead of text
        if not next_link:
            break
            
        page += 1

def scrape_all_details(conn):
    """Iterate through all words that haven't been scraped yet and get their details."""
    cursor = conn.cursor()
    
    # Get total count
    cursor.execute("SELECT COUNT(*) FROM words")
    total_words = cursor.fetchone()[0]
    
    request_count = 0
    
    while True:
        # Fetch a batch of unscraped words
        cursor.execute("SELECT id, word FROM words WHERE details_scraped = 0 LIMIT 100")
        rows = cursor.fetchall()
        
        if not rows:
            print("All words scraped!")
            break
            
        cursor.execute("SELECT COUNT(*) FROM words WHERE details_scraped = 1")
        scraped_count = cursor.fetchone()[0]
        print(f"Scraping details... Progress: {scraped_count}/{total_words} words.")
        
        for word_id, word_text in rows:
            print(f"Scraping details for '{word_text}'...")
            scrape_word_details(conn, word_id, word_text, request_count)
            request_count += 1

def populate_rhyme_families(conn):
    # ... (same as before) ...
    print("Populating rhyme family statistics...")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM rhyme_families")
    cursor.execute('''
    SELECT rhyme_family, COUNT(*), GROUP_CONCAT(word)
    FROM words
    WHERE rhyme_family IS NOT NULL
    GROUP BY rhyme_family
    ORDER BY COUNT(*) DESC
    ''')
    rows = cursor.fetchall()
    for row in rows:
        family, count, examples = row
        example_list = examples.split(',')[:5]
        example_str = ', '.join(example_list)
        cursor.execute('''
        INSERT INTO rhyme_families (family_key, count, example_words)
        VALUES (?, ?, ?)
        ''', (family, count, example_str))
    conn.commit()
    print(f"Populated {len(rows)} rhyme families.")

def main():
    conn = setup_database()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print("Running in TEST mode...")
        scrape_index_letter(conn, 'A')
        fid = process_word(conn, 'fabric')
        scrape_word_details(conn, fid, 'fabric', 0)
        populate_rhyme_families(conn)
        return

    # Phase 1: Scrape the Index (Fast, gets all words)
    print("PHASE 1: Scraping Index...")
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for char in letters:
        scrape_index_letter(conn, char)
        
    # Phase 2: Scrape Details (Slow, visits every word page)
    print("PHASE 2: Scraping Details...")
    scrape_all_details(conn)
            
    # Phase 3: Post-process
    populate_rhyme_families(conn)
            
    conn.close()
    print("Done!")

if __name__ == "__main__":
    main()
