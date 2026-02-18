import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

/* ─── Fonts via @import in style tag ─────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; background: #FFFFFF; }
    body { font-family: 'DM Mono', monospace; cursor: default; }
    ::-webkit-scrollbar { display: none; }
    .panel-scroll { overflow-y: auto; scrollbar-width: none; }
    .panel-scroll::-webkit-scrollbar { display: none; }
  `}</style>
);

/* ─── Color Palette ───────────────────────────────────────── */
const COLORS = {
  bg:     "#FFFFFF",
  mauve:  "#D6C9C5",
  navy:   "#0C2C47",
  yellow: "#DA9B2B",
  green:  "#2E5749",
  orange: "#BF512C",
  mint:   "#ABCBCA",
};

const GROUPS = {
  org:     { label: "Organization", color: COLORS.navy,   textColor: "#fff" },
  general: { label: "General",      color: COLORS.mauve,  textColor: COLORS.navy },
  racing:  { label: "Racing",       color: COLORS.yellow, textColor: COLORS.navy },
  astrid:  { label: "Astrid",       color: COLORS.green,  textColor: "#fff" },
  sigma:   { label: "Sigma",        color: COLORS.orange, textColor: "#fff" },
  rocket:  { label: "Rocket",       color: COLORS.mint,   textColor: COLORS.navy },
};

/* ─── SVG Icon Paths (Heroicons outline) ──────────────────── */
const PATHS = {
  grid:     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>,
  chart:    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>,
  calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>,
  trophy:   <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/>,
  users:    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>,
  mail:     <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>,
  phone:    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>,
  heart:    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>,
  star:     <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>,
  bolt:     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>,
  cog:      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"/>,
  map:      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>,
  info:     <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>,
  building: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>,
  car:      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>,
  rocket:   <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>,
  plane:    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>,
  flag:     <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"/>,
  wrench:   <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/>,
  cpu:      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"/>,
  beaker:   <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/>,
};

const Icon = ({ name, size, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke={color || "#fff"} width={size} height={size}>
    {PATHS[name] || PATHS.info}
  </svg>
);

/* ─── Node Definitions ────────────────────────────────────── */
const RAW_NODES = [
  // ORG
  { id:"org-bem",       label:"BEM",                  group:"org",     icon:"grid",     r:46 },
  { id:"org-datathon",  label:"Datathon",              group:"org",     icon:"chart",    r:56 },
  { id:"org-auto-evo",  label:"Automotive Evolution",  group:"org",     icon:"car",      r:64 },
  { id:"org-defense",   label:"Defense Industry",      group:"org",     icon:"flag",     r:50 },
  { id:"org-ces",       label:"CES",                   group:"org",     icon:"bolt",     r:42 },
  { id:"org-tubitak",   label:"TUBITAK Projects",      group:"org",     icon:"beaker",   r:54 },
  { id:"org-members",   label:"Org Members",           group:"org",     icon:"users",    r:48 },
  { id:"org-sponsors",  label:"Sponsor List",          group:"org",     icon:"star",     r:44 },
  { id:"org-side",      label:"Side Projects",         group:"org",     icon:"wrench",   r:46 },
  { id:"org-schema",    label:"Org Schema",            group:"org",     icon:"building", r:60 },
  // General
  { id:"gen-vision",    label:"Vision & Mission",      group:"general", icon:"bolt",     r:62 },
  { id:"gen-board",     label:"Board Members",         group:"general", icon:"users",    r:52 },
  { id:"gen-instruct",  label:"Responsible Instructors",group:"general",icon:"info",     r:46 },
  { id:"gen-contact",   label:"Contact Us",            group:"general", icon:"phone",    r:44 },
  { id:"gen-comm",      label:"Communication",         group:"general", icon:"mail",     r:50 },
  { id:"gen-thanks",    label:"Thank You",             group:"general", icon:"heart",    r:42 },
  // Racing
  { id:"racing-members",label:"Racing Members",        group:"racing",  icon:"users",    r:52 },
  { id:"racing-project",label:"Racing Project",        group:"racing",  icon:"car",      r:66 },
  { id:"racing-sponsors",label:"Racing Sponsors",      group:"racing",  icon:"star",     r:44 },
  { id:"racing-contact",label:"Racing Contact",        group:"racing",  icon:"mail",     r:46 },
  { id:"racing-org",    label:"Racing Org",            group:"racing",  icon:"building", r:50 },
  { id:"racing-history",label:"Racing History",        group:"racing",  icon:"trophy",   r:48 },
  // Astrid
  { id:"astrid-members",label:"Astrid Members",        group:"astrid",  icon:"users",    r:50 },
  { id:"astrid-project",label:"Astrid Project",        group:"astrid",  icon:"plane",    r:68 },
  { id:"astrid-sponsors",label:"Astrid Sponsors",      group:"astrid",  icon:"star",     r:42 },
  { id:"astrid-contact",label:"Astrid Contact",        group:"astrid",  icon:"phone",    r:44 },
  { id:"astrid-org",    label:"Astrid Org",            group:"astrid",  icon:"map",      r:52 },
  { id:"astrid-history",label:"Astrid History",        group:"astrid",  icon:"calendar", r:48 },
  // Sigma
  { id:"sigma-members", label:"Sigma Members",         group:"sigma",   icon:"users",    r:48 },
  { id:"sigma-project", label:"Sigma Project",         group:"sigma",   icon:"cog",      r:66 },
  { id:"sigma-sponsors",label:"Sigma Sponsors",        group:"sigma",   icon:"star",     r:44 },
  { id:"sigma-contact", label:"Sigma Contact",         group:"sigma",   icon:"mail",     r:46 },
  { id:"sigma-org",     label:"Sigma Org",             group:"sigma",   icon:"building", r:50 },
  { id:"sigma-history", label:"Sigma History",         group:"sigma",   icon:"trophy",   r:52 },
  // Rocket
  { id:"rocket-members",label:"Rocket Members",        group:"rocket",  icon:"users",    r:50 },
  { id:"rocket-project",label:"Rocket Project",        group:"rocket",  icon:"rocket",   r:70 },
  { id:"rocket-sponsors",label:"Rocket Sponsors",      group:"rocket",  icon:"star",     r:44 },
  { id:"rocket-contact",label:"Rocket Contact",        group:"rocket",  icon:"mail",     r:46 },
  { id:"rocket-org",    label:"Rocket Org",            group:"rocket",  icon:"map",      r:52 },
  { id:"rocket-history",label:"Rocket History",        group:"rocket",  icon:"calendar", r:48 },
];

/* ─── Simple D3-Force-like simulation (pure JS) ──────────── */
function runSimulation(nodes, W, H, iterations = 300) {
  const padding = 18;
  const ns = nodes.map((n, i) => ({
    ...n,
    x: W * 0.1 + Math.random() * W * 0.8,
    y: H * 0.1 + Math.random() * H * 0.8,
    vx: 0, vy: 0,
  }));

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations;

    // Center gravity
    for (const n of ns) {
      n.vx += (W / 2 - n.x) * 0.004 * alpha;
      n.vy += (H / 2 - n.y) * 0.004 * alpha;
    }

    // Collision repulsion
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const a = ns[i], b = ns[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const minDist = a.r + b.r + padding;
        if (dist < minDist) {
          const force = ((minDist - dist) / dist) * 0.5 * alpha;
          const fx = dx * force, fy = dy * force;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }
    }

    // Many-body weak repulsion (spread)
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const a = ns[i], b = ns[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist2 = dx * dx + dy * dy;
        const strength = -30 / (dist2 + 1);
        a.vx += (dx / Math.sqrt(dist2 + 1)) * strength * alpha * 0.1;
        a.vy += (dy / Math.sqrt(dist2 + 1)) * strength * alpha * 0.1;
        b.vx -= (dx / Math.sqrt(dist2 + 1)) * strength * alpha * 0.1;
        b.vy -= (dy / Math.sqrt(dist2 + 1)) * strength * alpha * 0.1;
      }
    }

    // Integrate + boundary
    for (const n of ns) {
      n.vx *= 0.6; n.vy *= 0.6;
      n.x += n.vx; n.y += n.vy;
      n.x = Math.max(n.r + 16, Math.min(W - n.r - 16, n.x));
      n.y = Math.max(n.r + 70, Math.min(H - n.r - 16, n.y));
    }
  }

  return ns;
}

/* ─── Soft ambient float offsets ─────────────────────────── */
const FLOAT_VARIANTS = [
  { y: [-6, 6], duration: 5.2 },
  { y: [-8, 4], duration: 6.5 },
  { y: [-4, 8], duration: 4.8 },
  { y: [-7, 3], duration: 7.1 },
  { y: [-5, 7], duration: 5.9 },
];

/* ─── Tooltip ─────────────────────────────────────────────── */
const Tooltip = ({ label }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 6 }}
    transition={{ duration: 0.18 }}
    style={{
      position: "absolute",
      bottom: "calc(100% + 10px)",
      left: "50%",
      transform: "translateX(-50%)",
      background: COLORS.navy,
      color: "#fff",
      fontFamily: "'DM Mono', monospace",
      fontSize: "0.58rem",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      padding: "5px 11px",
      borderRadius: 3,
      pointerEvents: "none",
      zIndex: 9999,
    }}
  >
    {label}
    <span style={{
      position: "absolute", top: "100%", left: "50%",
      transform: "translateX(-50%)",
      border: "5px solid transparent",
      borderTopColor: COLORS.navy,
    }} />
  </motion.div>
);

/* ─── Panel Content ───────────────────────────────────────── */
const PANEL_CONTENT = {
  default: { subtitle: "Explore this section", body: "Content and details for this topic will appear here. Connect your data source or CMS to populate each page dynamically." }
};
const getPanelContent = (node) => ({
  subtitle: `${GROUPS[node.group].label} / ${node.label}`,
  body: `This section covers everything related to ${node.label}. Add your project documentation, member lists, sponsor details, or organizational information here.\n\nUse this panel to navigate deeper into the ${GROUPS[node.group].label} domain and discover related topics and resources.`,
});

/* ─── Main App ────────────────────────────────────────────── */
export default function App() {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [nodes, setNodes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [ready, setReady] = useState(false);
  const isDraggingZoom = useRef(false);
  const zoomStartY = useRef(0);
  const zoomStartVal = useRef(1);

  // Run simulation on mount / resize
  useEffect(() => {
    const { w, h } = dims;
    const simmed = runSimulation(RAW_NODES.map(n => ({ ...n })), w, h, 400);
    setNodes(simmed);
    setTimeout(() => setReady(true), 50);
  }, [dims]);

  useEffect(() => {
    const onResize = () => {
      setDims({ w: window.innerWidth, h: window.innerHeight });
      setSelected(null);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Zoom slider drag
  const onZoomPointerDown = useCallback((e) => {
    e.preventDefault();
    isDraggingZoom.current = true;
    zoomStartY.current = e.clientY;
    zoomStartVal.current = zoom;
    const up = () => { isDraggingZoom.current = false; };
    const move = (ev) => {
      if (!isDraggingZoom.current) return;
      const dy = zoomStartY.current - ev.clientY;
      const newZoom = Math.max(0.35, Math.min(1.6, zoomStartVal.current + dy / 180));
      setZoom(newZoom);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointerup", () => window.removeEventListener("pointermove", move), { once: true });
  }, [zoom]);

  // Wheel zoom
  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault();
      setZoom(z => Math.max(0.35, Math.min(1.6, z - e.deltaY / 600)));
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const handleSelect = (node) => {
    if (selected?.id === node.id) return;
    setSelected(node);
    setHovered(null);
  };
  const handleBack = () => setSelected(null);

  const panelW = Math.min(520, dims.w * 0.9);

  return (
    <>
      <GlobalStyles />

      {/* Header */}
      <motion.header
        animate={{ opacity: selected ? 0 : 1, y: selected ? -20 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "26px 48px",
          pointerEvents: selected ? "none" : "auto",
        }}
      >
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.05rem", color: COLORS.navy, letterSpacing: "0.04em" }}>
          Organization Hub
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.navy, opacity: 0.45 }}>
          {nodes.length} Topics
        </span>
      </motion.header>

      {/* Canvas */}
      <div ref={containerRef} style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative", background: COLORS.bg }}>

        {/* Zoomable stage */}
        <motion.div
          animate={{ scale: zoom, x: selected ? -(panelW / 2) : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
          style={{ width: "100%", height: "100%", transformOrigin: "center center", position: "relative" }}
        >
          {/* Circles */}
          {ready && nodes.map((node, i) => {
            const g = GROUPS[node.group];
            const isSelected = selected?.id === node.id;
            const hasSelection = !!selected;
            const floatV = FLOAT_VARIANTS[i % FLOAT_VARIANTS.length];
            const iconSize = Math.round(node.r * 0.52);

            return (
              <motion.div
                key={node.id}
                layoutId={`circle-${node.id}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isSelected ? 0 : (hasSelection ? 0.85 : 1),
                  opacity: isSelected ? 0 : (hasSelection ? 0.35 : 1),
                  x: node.x - node.r,
                  y: node.y - node.r,
                }}
                transition={isSelected
                  ? { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
                  : { type: "spring", stiffness: 80, damping: 18, delay: i * 0.022 }
                }
                onHoverStart={() => !hasSelection && setHovered(node.id)}
                onHoverEnd={() => setHovered(null)}
                onClick={() => !hasSelection && handleSelect(node)}
                style={{
                  position: "absolute",
                  width: node.r * 2,
                  height: node.r * 2,
                  borderRadius: "50%",
                  background: g.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: hasSelection ? "default" : "pointer",
                  willChange: "transform",
                  boxShadow: hovered === node.id ? `0 16px 48px -8px ${g.color}99` : "0 4px 18px rgba(0,0,0,0.08)",
                }}
                whileHover={!hasSelection ? { scale: 1.1 } : {}}
              >
                {/* Gentle float animation layer */}
                <motion.div
                  animate={{ y: floatV.y }}
                  transition={{ duration: floatV.duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: i * 0.15 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Icon name={node.icon} size={iconSize} color={g.textColor} />
                </motion.div>

                {/* Tooltip */}
                <AnimatePresence>
                  {hovered === node.id && !hasSelection && (
                    <Tooltip label={node.label} />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Detail Panel ────────────────────────────────── */}
        <AnimatePresence>
          {selected && (() => {
            const g = GROUPS[selected.group];
            const content = getPanelContent(selected);
            const bigR = Math.min(110, selected.r * 1.5);

            return (
              <motion.div
                key="panel"
                initial={{ x: dims.w }}
                animate={{ x: dims.w - panelW }}
                exit={{ x: dims.w }}
                transition={{ type: "spring", stiffness: 110, damping: 22 }}
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  width: panelW,
                  height: "100vh",
                  background: "#fff",
                  boxShadow: "-20px 0 80px rgba(0,0,0,0.12)",
                  zIndex: 300,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Close / Back */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleBack}
                  style={{
                    position: "absolute", top: 28, left: 28,
                    background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.6rem", letterSpacing: "0.2em",
                    textTransform: "uppercase", color: COLORS.navy, opacity: 0.5,
                    padding: 0,
                  }}
                  whileHover={{ opacity: 1 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width={14} height={14}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
                  </svg>
                  Back
                </motion.button>

                <div className="panel-scroll" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 90, paddingBottom: 60, paddingLeft: 40, paddingRight: 40 }}>

                  {/* Hero circle – shared layout element */}
                  <motion.div
                    layoutId={`circle-${selected.id}`}
                    style={{
                      width: bigR * 2,
                      height: bigR * 2,
                      borderRadius: "50%",
                      background: g.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 24px 64px -16px ${g.color}88`,
                      flexShrink: 0,
                    }}
                    transition={{ type: "spring", stiffness: 90, damping: 18 }}
                  >
                    <Icon name={selected.icon} size={Math.round(bigR * 0.52)} color={g.textColor} />
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: "100%", marginTop: 36 }}
                  >
                    {/* Group tag */}
                    <div style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: 2,
                      background: g.color,
                      color: g.textColor,
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.55rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      marginBottom: 16,
                    }}>
                      {GROUPS[selected.group].label}
                    </div>

                    {/* Title */}
                    <h1 style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                      color: COLORS.navy,
                      lineHeight: 1.1,
                      marginBottom: 20,
                    }}>
                      {selected.label}
                    </h1>

                    {/* Accent bar */}
                    <div style={{ width: 40, height: 3, background: g.color, borderRadius: 2, marginBottom: 24 }} />

                    {/* Body */}
                    <p style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.8rem",
                      lineHeight: 1.85,
                      color: COLORS.navy,
                      opacity: 0.65,
                      whiteSpace: "pre-line",
                    }}>
                      {content.body}
                    </p>

                    {/* CTA */}
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: `0 8px 24px -6px ${g.color}88` }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        marginTop: 36,
                        padding: "13px 28px",
                        background: g.color,
                        color: g.textColor,
                        border: "none",
                        borderRadius: 3,
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "0.65rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      Open Full Page →
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* ── Zoom Control ─────────────────────────────────── */}
        <motion.div
          animate={{ opacity: selected ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            bottom: 40,
            right: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            userSelect: "none",
            pointerEvents: selected ? "none" : "auto",
            zIndex: 150,
          }}
        >
          <span style={{ fontFamily: "'DM Mono'", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.navy, opacity: 0.4 }}>
            zoom
          </span>

          {/* Track */}
          <div
            onPointerDown={onZoomPointerDown}
            style={{
              width: 3,
              height: 80,
              background: "#E5E0DD",
              borderRadius: 2,
              position: "relative",
              cursor: "ns-resize",
            }}
          >
            {/* Thumb */}
            <motion.div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: `${((zoom - 0.35) / (1.6 - 0.35)) * 100}%`,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: COLORS.navy,
                cursor: "ns-resize",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <button onClick={() => setZoom(z => Math.min(1.6, z + 0.1))}
              style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.navy, opacity: 0.5, fontSize: 14, lineHeight: 1, padding: "2px 4px" }}>+</button>
            <button onClick={() => setZoom(z => Math.max(0.35, z - 0.1))}
              style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.navy, opacity: 0.5, fontSize: 14, lineHeight: 1, padding: "2px 4px" }}>−</button>
          </div>
        </motion.div>

        {/* ── Legend ───────────────────────────────────────── */}
        <motion.div
          animate={{ opacity: selected ? 0 : 1, y: selected ? 10 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed", bottom: 36, left: 48, zIndex: 150,
            display: "flex", flexDirection: "column", gap: 6,
            pointerEvents: "none",
          }}
        >
          {Object.entries(GROUPS).map(([key, g]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: g.color,
                border: key === "general" ? "1.5px solid #0C2C47" : "none",
                flexShrink: 0,
              }} />
              <span style={{ fontFamily: "'DM Mono'", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: COLORS.navy, opacity: 0.5 }}>
                {g.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </>
  );
}