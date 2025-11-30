// A collection of rhyming groups.
// Each array is a group of words that rhyme with each other.

export interface RhymeFamily {
    family_id: string;
    label: string;
    count: number;
    words: string[];
}

export interface RhymeData {
    syllable_1_families: RhymeFamily[];
}

export const RHYME_GROUPS = [
    // "AT" sound
    ["cat", "bat", "sat", "hat", "mat", "rat", "fat", "pat", "vat", "gnat", "brat", "flat", "slat", "spat", "chat", "scat", "that", "splat", "combat", "format", "habitat", "acrobat", "thermostat", "diplomat", "laundromat"],

    // "IGHT" sound
    ["light", "night", "fight", "sight", "might", "right", "tight", "bright", "flight", "fright", "height", "knight", "plight", "slight", "blight", "trite", "white", "write", "kite", "bite", "cite", "site", "quite", "spite", "smite", "ignite", "invite", "polite", "recite", "unite", "excited", "delight", "tonight", "midnight", "starlight", "sunlight", "moonlight", "flashlight", "headlight", "spotlight"],

    // "ATION" sound
    ["nation", "station", "ration", "creation", "relation", "inflation", "location", "vacation", "donation", "duration", "sensation", "temptation", "vibration", "foundation", "graduation", "situation", "population", "regulation", "reputation", "inspiration", "admiration", "decoration", "generation", "operation", "separation", "celebration", "combination", "imagination", "preparation", "information", "observation", "conversation", "transportation", "communication", "determination"],

    // "AKE" sound
    ["ake", "bake", "cake", "fake", "lake", "make", "rake", "sake", "take", "wake", "brake", "drake", "flake", "quake", "shake", "snake", "stake", "awake", "mistake", "pancake", "cupcake", "earthquake", "snowflake", "handshake", "keepsake", "namesake", "forsake", "opaque", "partake", "remake", "retake", "uptake"],

    // "EEL" sound
    ["eel", "feel", "heel", "keel", "peel", "reel", "steel", "wheel", "kneel", "squeal", "appeal", "conceal", "ordeal", "repeal", "reveal", "unreal", "ideal", "surreal", "automobile"],

    // "OWN" sound
    ["own", "down", "gown", "town", "brown", "clown", "crown", "drown", "frown", "noun", "renown", "uptown", "midtown", "downtown", "hometown", "sundown", "breakdown", "countdown", "meltdown", "shutdown", "touchdown"],

    // "ACK" sound
    ["back", "hack", "jack", "lack", "pack", "rack", "sack", "tack", "black", "crack", "knack", "quack", "slack", "smack", "snack", "stack", "track", "whack", "attack", "backpack", "feedback", "hijack", "knapsack", "playback", "quarterback", "racetrack", "soundtrack", "throwback"],

    // "INE" sound
    ["dine", "fine", "line", "mine", "nine", "pine", "sine", "tine", "vine", "wine", "brine", "shine", "spine", "swine", "twine", "whine", "shrine", "align", "assign", "benign", "combine", "confine", "declined", "define", "design", "divine", "enshrine", "entwine", "incline", "malign", "opine", "refine", "resign", "supine", "underline", "valentine", "porcupine", "turpentine"],

    // "ORE" sound
    ["ore", "bore", "core", "fore", "gore", "lore", "more", "pore", "sore", "tore", "wore", "chore", "score", "shore", "snore", "spore", "store", "swore", "adore", "before", "explore", "galore", "ignore", "implore", "restore", "uproar", "anymore", "carnivore", "commodore", "dinosaur", "evermore", "herbivore", "omnivore", "sophomore", "sycamore", "underscore"],

    // "EST" sound
    ["best", "chest", "crest", "guest", "jest", "nest", "pest", "quest", "rest", "test", "vest", "west", "zest", "blest", "dressed", "pressed", "stressed", "arrest", "attest", "bequest", "contest", "detest", "digest", "divest", "infest", "ingest", "invest", "molest", "protest", "request", "suggest", "unrest", "interest", "manifest"],

    // "ILL" sound
    ["ill", "bill", "dill", "fill", "gill", "hill", "kill", "mill", "pill", "quill", "sill", "till", "will", "chill", "drill", "frill", "grill", "krill", "skill", "spill", "still", "swill", "thrill", "trill", "twill", "distill", "fulfill", "instill", "refill", "uphill", "downhill", "windmill", "treadmill", "windowsill"],

    // "OP" sound
    ["bop", "cop", "hop", "lop", "mop", "pop", "sop", "top", "chop", "crop", "drop", "flop", "plop", "prop", "shop", "slop", "stop", "swap", "backdrop", "bellhop", "blacktop", "dewdrop", "eavesdrop", "flip-flop", "gumdrop", "hilltop", "laptop", "nonstop", "rainstop", "rooftop", "tabletop", "teardrop", "tip-top", "workshop"],

    // "UNK" sound
    ["bunk", "dunk", "funk", "hunk", "junk", "punk", "sunk", "chunk", "drunk", "flunk", "plunk", "skunk", "slunk", "spunk", "stunk", "trunk", "chipmunk", "cyberpunk", "spelunk"],

    // "ASH" sound
    ["ash", "bash", "cash", "dash", "gash", "hash", "lash", "mash", "rash", "sash", "clash", "crash", "flash", "slash", "smash", "stash", "thrash", "trash", "abash", "backlash", "eyelash", "mustache", "panache", "rehash", "splash", "succotash", "whiplash"],

    // "ING" sound
    ["king", "ring", "sing", "wing", "zing", "bring", "cling", "fling", "sling", "sting", "string", "swing", "thing", "wring", "anything", "everything", "nothing", "something", "upcoming", "shoestring", "underling"],

    // "OAT" sound
    ["boat", "coat", "goat", "moat", "oat", "bloat", "float", "gloat", "throat", "afloat", "connote", "devote", "emote", "promote", "remote", "unquote", "anecdote", "antidote", "overcoat", "petticoat", "raincoat", "sailboat", "scapegoat", "speedboat", "sugarcoat", "turncoat"],

    // "AIL" sound
    ["ail", "bail", "fail", "hail", "jail", "mail", "nail", "pail", "rail", "sail", "tail", "wail", "flail", "frail", "grail", "quail", "scale", "snail", "stale", "trail", "assail", "avail", "bewail", "cocktail", "curtail", "detail", "entail", "exhale", "impail", "inhale", "prevail", "retail", "travail", "unveil", "wholesale", "blackmail", "fingernail", "monorail", "pigtail", "ponytail", "thumbnail"],

    // "EAM" sound
    ["beam", "cream", "dream", "gleam", "ream", "seam", "steam", "team", "bream", "scream", "stream", "daydream", "downstream", "extreme", "icecream", "mainstream", "midstream", "moonbeam", "redeem", "regime", "sunbeam", "supreme", "upstream", "esteem"],

    // "ICE" sound
    ["ice", "dice", "lice", "mice", "nice", "rice", "vice", "price", "slice", "spice", "splice", "thrice", "trice", "twice", "advice", "concise", "device", "entice", "precise", "suffice", "paradise", "sacrifice", "edelweiss"],

    // "OON" sound
    ["boon", "croon", "loon", "moon", "noon", "soon", "spoon", "swoon", "baboon", "balloon", "bassoon", "buffoon", "cartoon", "cocoon", "dragoon", "festoon", "harpoon", "lampoon", "macaroon", "maroon", "monsoon", "platoon", "poltroon", "pontoon", "raccoon", "saloon", "tycoon", "honeymoon", "afternoon"]
];
