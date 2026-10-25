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
  role: "Game Designer & 3D Artist",
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
 * slug      = short id used in the page link (no spaces)
 * status    = shown as a tag on the game page, e.g. "Released", "In development"
 * team      = true for a team project; leave it out for a solo project
 * portrait  = true for mobile games, so screenshots show as phone screens
 * links     = buttons on the game page, add as many as you want
 * docs      = your design documents; each one becomes a card on the game page
 *
 * The game page has five sections. Leave any of them empty and it shows "Coming soon".
 *   overview  = a short paragraph about the game (role = what you did, for team games)
 *   mechanics = { name, text } cards
 *   loop      = the core loop steps, in order; loopBack = the line that closes the loop
 *   art       = short points about the art and UI; palette = { name, hex } colour swatches
 *   curve     = the intensity, novelty and tension curve:
 *               labels = the points along the bottom (time, levels...)
 *               groups = optional bands behind the chart, { label, from, to } (point numbers, from 0)
 *               intensity / novelty / tension = one number from 0 to 10 for each label
 *               note = one line on where the numbers come from
 */
const GAMES = [
  {
    slug: "hyper-flux",
    title: "Hyper Flux",
    genre: "3D speedrun platformer",
    platform: "PC (Windows) · Steam",
    style: "3D, stylised sci-fi",
    status: "Released on Steam · Jan 2025 · Team project",
    team: true,
    accent: "cyan",
    pitch:
      "Fly through shattered planets in a zero-gravity suit, pushing and pulling yourself with force orbs to reach the portal as fast as you can.",
    overview:
      "Elio, a tech-soldier, finally gets a 24-hour holiday to finish his bucket list, and then the world starts to end. " +
      "He straps on a zero-gravity suit and races across shattered planets to the end portal. A comical story that starts with a bang. Made as a team in 2024.",
    role:
      "3D asset building, and design of 2 levels on the Invisible Planet, where things only appear under a special light.",
    mechanics: [
      { name: "Force orbs", text: "Push and pull yourself through the level with force-manipulating orbs." },
      { name: "Zero-gravity suit", text: "Fly instead of run, and keep your momentum through every gap." },
      { name: "Fuel", text: "The suit runs on fuel, so every boost is a choice." },
      { name: "Suit upgrades", text: "Collect ingredients in the levels and use them to upgrade the suit." },
      { name: "Invisible Planet", text: "The world only shows up under a special light." },
      { name: "Leaderboards", text: "Every run is timed and ranked on Steam." },
    ],
    loop: [
      { name: "Run", text: "Race through a planet to the end portal." },
      { name: "Collect", text: "Grab ingredients along the way." },
      { name: "Upgrade", text: "Make the suit faster and stronger." },
      { name: "Beat your time", text: "Go again and climb the leaderboard." },
    ],
    loopBack: "",
    art: [
      "Stylised 3D sci-fi: broken planets floating in space.",
      "First-person camera, so the speed hits you directly.",
      "A light HUD: run timer at the top, speed at the bottom, gravity state in the corner.",
    ],
    palette: [],
    curve: null,
    cover: "assets/images/hyperflux-2.webp",
    screenshots: [
      "assets/images/hyperflux-2.webp",
      "assets/images/hyperflux-1.webp",
    ],
    trailer: "",
    links: [
      { label: "Get it on Steam", url: "https://store.steampowered.com/app/2813890/Hyper_Flux/" },
    ],
    docs: [],
  },
  {
    slug: "dole-shole",
    title: "Dole Shole",
    subtitle: "A beat 'em up for 1–2 players",
    genre: "2.5D beat 'em up",
    platform: "PC · couch co-op",
    style: "640×360 pixel art, CRT filter",
    status: "Level 1 of 5 in progress",
    accent: "rose",
    pitch:
      "Gym friends chase a kidnapping through five levels. It turns out to be a very rich dad's express home delivery.",
    overview:
      "A couch co-op brawler that feels like a lost 90s arcade cabinet from the future. It's 2125. Gym friends see a kid bundled into a van and give chase, " +
      "up a tower, onto a flying cargo truck and into a corporate high-rise. The kid was just late home. Dad booked Swift-Drop Express, " +
      "and Swift-Drop never takes no for an answer. A goofy action movie, played completely straight.",
    mechanics: [
      { name: "Lanes", text: "Walk up and down the floor to change lanes. Attacks only hit in the same lane, so moving is how you dodge." },
      { name: "Combos", text: "Each hit has to land to keep the combo going. Punch is always punch and kick is always kick." },
      { name: "Hit feel", text: "Hitstop, screen shake and knockback on every hit. Launched enemies bowl over the ones behind them." },
      { name: "Armour", text: "Armoured enemies shrug off light hits until a kick or a knockdown breaks through." },
      { name: "Fair fights", text: "Only two enemies attack at once, one from each side, and every attack glows red before it lands." },
      { name: "Special", text: "The panic button: invincible, hits both sides, costs a little health." },
      { name: "Co-op", text: "A second player can drop in at any time on the same screen." },
      { name: "Pickups", text: "Samosa, cutting chai and a butter chicken thali heal you. A protein shake doubles knockback." },
    ],
    loop: [
      { name: "Advance", text: "Walk in. The camera locks for the next fight." },
      { name: "Fight", text: "Clear one to three waves of goons." },
      { name: "Go", text: "The GO arrow leads to the next section." },
      { name: "Boss", text: "Every level ends with a two-phase boss." },
      { name: "Grade", text: "Score, time and damage give an S to D grade." },
    ],
    loopBack: "Each level adds a new enemy, a new stage mechanic and a new boss, then the loop starts again.",
    art: [
      "Pixel art at 640×360. Characters are about 150 px tall, in three-quarter view, with bold outlines.",
      "Retro sci-fi: the future as imagined in 1986. Chunky terminals, amber readouts and hazard stripes over an old bazaar.",
      "A one-point perspective trick: the floor and side walls skew as the camera moves, while the shop fronts stay flat.",
      "A CRT filter with scanlines and vignette, on by default.",
      "HUD: tactical panels in the top corners with portrait, health, lives and score. The level end is a delivery receipt.",
      "Colour coding: player 1 red, player 2 green, Swift-Drop staff in orange and deep purple.",
    ],
    palette: [
      { name: "Player 1", hex: "#e0483e" },
      { name: "Player 2", hex: "#3dbb6e" },
      { name: "Amber readout", hex: "#ffb53c" },
      { name: "Terminal", hex: "#0d0b14" },
    ],
    curve: {
      labels: ["Start", "Peak", "Boss", "Start", "Peak", "Boss", "Start", "Peak", "Boss", "Start", "Peak", "Boss", "Start", "Peak", "Final"],
      groups: [
        { label: "1 · Street", from: 0, to: 2 },
        { label: "2 · Elevator", from: 3, to: 5 },
        { label: "3 · Cargo truck", from: 6, to: 8 },
        { label: "4 · Corridor", from: 9, to: 11 },
        { label: "5 · Boss floor", from: 12, to: 14 },
      ],
      intensity: [1.5, 3.3, 4.5, 2.5, 4.5, 5.5, 3, 5, 6.5, 4, 6.3, 7.5, 5, 7.8, 9.5],
      novelty:   [8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 7, 5, 9],
      tension:   [2, 5, 7, 3, 7, 8, 3, 7, 8.5, 4, 8, 9, 5, 9, 10],
      note: "Intensity comes from the planned enemy threat per section. Novelty and tension follow the pacing rules in the design bible.",
    },
    cover: "assets/images/beatemup-fight.webp",
    screenshots: [
      "assets/images/beatemup-select.webp",
      "assets/images/beatemup-street.webp",
      "assets/images/beatemup-fight.webp",
      "assets/images/beatemup-boss.webp",
    ],
    trailer: "",
    links: [],
    docs: [
      { title: "Design Bible", url: "https://claude.ai/artifact/SeD2rHPqbreBwznNV8aJT4", note: "Story, characters, move list, enemies, bosses, levels and build status" },
    ],
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
    overview:
      "An alternate reality where India never got its freedom. It's 1970 Calcutta, and the British rule through " +
      "clockwork and steampunk technology. That technology secretly runs on a power source from another universe, " +
      "one mentioned in Indian scriptures, and the British have learned to harness it. No one knows. Then Rahu, " +
      "a thief, stumbles onto it while robbing the facility where the automaton robots are built.",
    mechanics: [
      { name: "First-person stealth", text: "Stealth and action, seen through Rahu's eyes." },
      { name: "Clockwork automatons", text: "The enemies are the Empire's clockwork robots." },
    ],
    loop: [],
    loopBack: "",
    art: [
      "3D clockwork and steampunk, set in an alternate-history 1970 Calcutta.",
    ],
    palette: [],
    curve: null,
    cover: "",
    screenshots: [],
    trailer: "",
    links: [],
    docs: [],
  },
  {
    slug: "horn-ok-please",
    title: "Horn OK Please",
    subtitle: "Mai Nikla Gaddi Le Ke",
    genre: "Endless lane runner",
    platform: "Mobile & PC",
    style: "Top-down pixel art, truck-art palette",
    status: "In development",
    accent: "marigold",
    portrait: true,
    pitch:
      "A one-thumb highway runner. Tow a swinging trailer through trucks, tuk-tuks, camel carts and cows.",
    overview:
      "You drive a farm tractor pulling a trailer along a highway that never ends. Tap left or right to switch lanes and dodge the traffic. " +
      "Every 800 metres the road crosses into a new region, from the beach to the mountains, with new traffic, obstacles and music. " +
      "Lose your last life and the run is over. Built for short, repeatable runs of 2 to 6 minutes.",
    mechanics: [
      { name: "One-thumb steering", text: "Tap the left or right half of the screen to move exactly one lane." },
      { name: "Swinging trailer", text: "The trailer swings behind the tractor on every lane change, so steering feels heavy." },
      { name: "Traffic that signals", text: "After 30 seconds some vehicles blink an indicator, then swerve. You learn to read it." },
      { name: "Changing road", text: "The road narrows to 3 lanes or widens to 7, with a warning before it happens." },
      { name: "Always a way through", text: "Before anything spawns, the game checks there's still a free lane you can reach." },
      { name: "Power-ups", text: "Nazar Shield, Turbo, Magnet, Double Coins, Chai Break and Score x2." },
    ],
    loop: [
      { name: "Drive", text: "The road scrolls on its own and keeps getting faster." },
      { name: "Dodge", text: "Switch lanes to avoid traffic and roadblocks." },
      { name: "Collect", text: "Grab coin trails and power-ups." },
      { name: "Crash out", text: "Lose your last life. See your score and coins." },
    ],
    loopBack: "Then spend coins in the Garage on upgrades and skins, and drive again to beat your best.",
    art: [
      "Top-down pixel art on a portrait screen. The road fills the middle and the edges show each region's roadside props.",
      "The colours of truck art: marigold, vermilion, teal and rani pink on a deep night blue.",
      "The UI looks like the painted back of a goods truck, with metal plates and rivets.",
      "HUD: pause and hearts top left with power-up timers below, score and coins top right. The middle stays clear for the road.",
      "Motion: wheels spin, vehicles throb like idling engines, the tractor tilts into turns and the trailer swings.",
    ],
    palette: [
      { name: "Marigold", hex: "#f2b01e" },
      { name: "Vermilion", hex: "#e2452c" },
      { name: "Teal", hex: "#2fb3a2" },
      { name: "Rani pink", hex: "#d84f86" },
      { name: "Night plate", hex: "#252845" },
    ],
    curve: {
      labels: ["0:00", "0:30", "1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30", "5:00", "5:30", "6:00", "6:30", "7:00"],
      groups: [],
      intensity: [3.3, 4, 4.7, 5.3, 6, 6.7, 7.3, 8, 8.7, 9.3, 10, 10, 10, 10, 10],
      novelty:   [5, 6, 3, 3, 9, 4, 4, 7, 3, 7, 4, 6, 3, 2, 2],
      tension:   [1, 2.5, 3.5, 3, 6, 7.5, 5.5, 6, 7.5, 6.5, 8.5, 8, 9, 9, 9.5],
      note: "Intensity is the road speed, rising from 1× to 3× over five minutes. Novelty peaks at swerving traffic, lane changes and new regions. Tension is the design target, to be checked in playtests.",
    },
    cover: "",         // portrait games use their screenshots as the cover
    screenshots: [
      "assets/images/horn-menu.webp",
      "assets/images/horn-beach.webp",
      "assets/images/horn-desert.webp",
      "assets/images/horn-mountains.webp",
      "assets/images/horn-garage.webp",
      "assets/images/horn-paused.webp",
    ],
    trailer: "",       // YouTube embed link, e.g. "https://www.youtube.com/embed/VIDEO_ID"
    links: [],         // e.g. { label: "Play on itch.io", url: "https://wrath65.itch.io/..." }
    docs: [
      { title: "Game Design Document", url: "https://claude.ai/artifact/1qfrEE1BnVPwnG2atGEr7X", note: "Core loop, regions, economy, tension curve, UI, art and playtesting" },
    ],
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
