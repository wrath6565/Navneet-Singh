/*
 * ============================================================
 *  ALL SITE CONTENT LIVES HERE.
 *  Edit this file to change text, add games, or add work.
 *  You never need to touch the HTML or CSS to add new stuff.
 *
 *  Images: drop files into /assets/images/ and set the path,
 *  e.g. cover: "assets/images/tractor-cover.png"
 *  Leave a field as "" (empty) and the site shows a placeholder.
 * ============================================================
 */

const SITE = {
  name: "Navneet Singh",
  handle: "Wrath65",
  role: "Game Designer",
  tagline: "I make the games I want to play.",
  intro: "Fun first. Everything after that is problem solving.",
  /*
   * SHOWREEL: plays at the very top of the site.
   * Option A: put a file in assets/video/ and set file, e.g. "assets/video/showreel.mp4"
   *           (keep it short, muted-friendly, under ~25 MB; it loops silently in the background)
   * Option B: set youtube to the video ID, e.g. "dQw4w9WgXcQ" (used for the "Watch full reel" button)
   * poster = an image shown while the video loads
   * slides = until there's a video, these screenshots play as a slow slideshow instead
   */
  showreel: {
    file: "",
    youtube: "",
    poster: "",
    slides: [
      "assets/images/beatemup-fight.webp",
      "assets/images/hyperflux-2.webp",
      "assets/images/beatemup-boss.webp",
      "assets/images/hyperflux-1.webp",
      "assets/images/beatemup-street.webp",
    ],
  },
  contact: {
    email: "navneetsinghds@gmail.com",
    itch: "https://wrath65.itch.io/",
    github: "https://github.com/wrath6565",
    // Add more if you like, e.g. linkedin: "https://linkedin.com/in/..."
  },
};

/*
 * GAMES
 * slug   = short id used in the page link (no spaces)
 * status = shown as a tag, e.g. "Released", "In development", "Prototype"
 * links  = buttons on the game page, add as many as you want
 * docs   = your design documents; each one becomes a card on the game page
 * portrait = true for mobile games, so screenshots show as phone screens
 */
const GAMES = [
  {
    slug: "horn-ok-please",
    title: "Horn OK Please",
    subtitle: "Mai Nikla Gaddi Le Ke",
    genre: "Endless runner",
    platform: "Mobile",
    style: "Pixel art",
    status: "In development",
    accent: "marigold",
    portrait: true,
    pitch:
      "Drive a tractor with a trolley that swings behind you on a delay. Dodge traffic and obstacles across India.",
    story:
      "Hit the road across India's regions: the coast, the plateau, the desert, the plains and the mountains. " +
      "Each region brings its own traffic, obstacles and scenery.",
    features: [
      "Delayed trolley swing: you steer the tractor and have to plan for the trolley",
      "Five regions of India: Coastal, Plateau, Desert, Plains, Mountains",
      "Hand-made pixel art inspired by Indian truck art",
      "Garage, coins and a leaderboard",
      "Built for mobile touch controls",
    ],
    cover: "",         // portrait games use their screenshots as the cover
    screenshots: [
      "assets/images/horn-menu.webp",
      "assets/images/horn-gameplay.webp",
      "assets/images/horn-paused.webp",
    ],
    trailer: "",       // YouTube embed link, e.g. "https://www.youtube.com/embed/VIDEO_ID"
    links: [],         // e.g. { label: "Play on itch.io", url: "https://wrath65.itch.io/..." }
    docs: [],          // e.g. { title: "Game Design Doc", url: "docs/tractor-gdd.pdf", note: "Core loop & regions" }
  },
  {
    slug: "express-delivery-2125",
    title: "Express Delivery 2125",        // working title, rename anytime
    genre: "2.5D Beat 'em up",
    platform: "PC",
    style: "2D pixel art with CRT filter",
    status: "Level 1 of 5 complete",
    accent: "rose",
    pitch:
      "A group of bodybuilder friends see a girl being kidnapped and go after her. It turns out she was just late.",
    story:
      "India, 2125. A few bodybuilder friends walk out of the gym and see a girl being dragged away. " +
      "They chase the kidnappers, only to find out the girl was running late, so her father hired an express " +
      "delivery service that doesn't take no for an answer. Inspired by Teenage Mutant Ninja Turtles and " +
      "Marvel Cosmic Invasion.",
    features: [
      "5 stages with different kinds of goons and a boss fight at the end of each",
      "Currently: Level 1 done with 2 playable characters, 5 enemy types and 1 boss",
      "Fighters so far: The Powerlifter and The Show-Off",
      "First boss: Big Pappu",
      "Light and heavy strings, dive attacks, charged heavies and a combo-filled special",
      "Local co-op: Player 2 can press Start and jump in",
      "2D pixel art with a CRT TV filter",
      "Futuristic India setting, 2125",
    ],
    cover: "assets/images/beatemup-fight.webp",
    screenshots: [
      "assets/images/beatemup-select.webp",
      "assets/images/beatemup-street.webp",
      "assets/images/beatemup-fight.webp",
      "assets/images/beatemup-boss.webp",
    ],
    trailer: "",
    links: [],
    docs: [],
  },
  {
    slug: "rahu-1970",
    title: "Rahu: 1970",                    // working title, rename anytime
    genre: "First-person stealth action",
    platform: "PC",
    style: "3D, clockwork / steampunk",
    status: "Work in progress",
    accent: "brass",
    pitch:
      "In an India that never won its freedom, steal the secret power behind the British Empire's clockwork machines.",
    story:
      "An alternate reality where India never got its freedom. It's 1970 Calcutta, and the British rule through " +
      "clockwork and steampunk technology. That technology secretly runs on a power source from another universe, " +
      "one mentioned in Indian scriptures, and the British have learned to harness it. No one knows. Then Rahu, " +
      "a thief, stumbles onto it while robbing the facility where the automaton robots are built.",
    features: [
      "First-person stealth and action",
      "Alternate-history 1970 Calcutta",
      "Clockwork automaton enemies",
      "A mythic power source taken from Indian scriptures",
    ],
    cover: "",
    screenshots: [],
    trailer: "",
    links: [],
    docs: [],
  },
  {
    slug: "hyper-flux",
    title: "Hyper Flux",
    genre: "Gravity speedrunner",
    platform: "PC",
    style: "3D",
    status: "Released · 2024 · Team project",
    accent: "cyan",
    pitch:
      "One day off from an evil corporate job, a galaxy-wide explosion, and a suit that bends gravity. Speedrun across 4 planets.",
    story:
      "The hero finally gets one day of holiday from his evil corporate job, and then a galaxy-wide explosion " +
      "hits. He can get evacuated, or he can put on a special suit that manipulates gravity and race across four " +
      "planets. He chooses the suit. Made with a friend in 2024.",
    role:
      "3D asset building, and design of 2 levels on the Invisible Planet, where things only appear under a special light.",
    features: [
      "Gravity manipulation with a specialised suit",
      "Speedrunning across 4 planets",
      "Invisible Planet: the world only shows up under special light",
    ],
    cover: "assets/images/hyperflux-2.webp",
    screenshots: [
      "assets/images/hyperflux-2.webp",
      "assets/images/hyperflux-1.webp",
    ],
    trailer: "",
    links: [],
    docs: [],
  },
];

/*
 * EXPLORATION: other work (design pitches, experiments, art)
 * type = small label on the card
 */
const EXPLORATIONS = [
  {
    title: "Archero: Live Event Design",
    type: "Game design · Monetisation",
    summary:
      "An event design for Archero that turns one-time buyers into repeat spenders.",
    image: "",
    url: "",   // link to a PDF, doc, or slides
  },
  {
    title: "Unity Explorations",
    type: "Tech · Prototypes",
    summary: "Small experiments in mechanics, shaders and systems in Unity.",
    image: "",
    url: "",
  },
  {
    title: "3D Art",
    type: "Art · Modelling",
    summary: "Models, props and environments.",
    image: "",
    url: "",
  },
  {
    title: "More coming soon",
    type: "???",
    summary: "The next chapter is being written.",
    image: "",
    url: "",
  },
];
