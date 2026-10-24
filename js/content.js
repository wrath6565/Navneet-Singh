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
  handle: "Wrath",
  tagline: "Game designer & developer building worlds rooted in India.",
  intro:
    "I make games that mix arcade energy with Indian settings, myths and humour, " +
    "from pixel-art tractors swinging through traffic to steampunk Calcutta in 1970. " +
    "This is where I keep everything I'm building.",
  // Short facts shown on the home screen
  stats: [
    { label: "Games", value: "4" },
    { label: "Engine", value: "Unity" },
    { label: "Based in", value: "India" },
  ],
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
 */
const GAMES = [
  {
    slug: "tractor-trolley-run",
    title: "Tractor Trolley Run",          // working title, rename anytime
    genre: "Endless runner",
    platform: "Mobile",
    style: "Pixel art",
    status: "In development",
    accent: "saffron",
    pitch:
      "Drive a tractor with a trolley that swings behind you on a delay. Dodge traffic and obstacles across India.",
    story:
      "Hit the road across India's regions: the coast, the plateau, the desert, the plains and the mountains. " +
      "Each region brings its own traffic, obstacles and scenery.",
    features: [
      "Delayed trolley swing: you steer the tractor and have to plan for the trolley",
      "Five regions of India: Coastal, Plateau, Desert, Plains, Mountains",
      "Hand-made pixel art",
      "Built for mobile touch controls",
    ],
    cover: "",
    screenshots: [],
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
    accent: "magenta",
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
      "2D pixel art with a CRT TV filter",
      "Futuristic India setting, 2125",
    ],
    cover: "",
    screenshots: [],
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
    accent: "teal",
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
    accent: "violet",
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
    cover: "",
    screenshots: [],
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
    summary: "Insert coin to continue…",
    image: "",
    url: "",
  },
];
