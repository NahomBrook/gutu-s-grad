/* =============================================
   STATIC DATA — Edit freely to customise
   ============================================= */

function makeSvg(colors, emoji) {
  const [c1, c2, c3 = c2] = colors;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="${c1}"/>
        <stop offset="55%"  stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c3}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#g)"/>
    <text x="400" y="320" text-anchor="middle" dominant-baseline="middle"
          font-size="160" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/* --------------------------------------------------
   GALLERY IMAGES
   Photos live in /public/ (served as /filename.jpg).
   To add more photos, copy them to /public/ and add
   entries here following the same pattern.
   -------------------------------------------------- */
export const GALLERY_IMAGES = [
  // ---- Ceremony ----
  { id:  1, category: 'ceremony',    label: 'The Big Moment',        emoji: '🎓', realSrc: '/465A3383.JPG', gradient: 'linear-gradient(135deg,#1a0a2e,#4a1060,#c9a84c)', colors: ['#1a0a2e','#4a1060','#c9a84c'] },
  { id:  2, category: 'ceremony',    label: 'Receiving the Diploma',  emoji: '📜', realSrc: '/465A3395.JPG', gradient: 'linear-gradient(135deg,#0a1530,#1060a8,#4cc9a8)', colors: ['#0a1530','#1060a8','#4cc9a8'] },
  { id:  3, category: 'ceremony',    label: 'Walking the Stage',      emoji: '👑', realSrc: '/465A3414.JPG', gradient: 'linear-gradient(135deg,#1a2e0a,#406010,#c9a84c)', colors: ['#1a2e0a','#406010','#c9a84c'] },
  { id:  4, category: 'ceremony',    label: 'Cap and Gown',           emoji: '🏛️', realSrc: '/465A3416.JPG', gradient: 'linear-gradient(135deg,#2e0a1a,#801040,#c94c84)', colors: ['#2e0a1a','#801040','#c94c84'] },
  { id:  5, category: 'ceremony',    label: 'A Proud Graduate',       emoji: '🎊', realSrc: '/465A3455.JPG', gradient: 'linear-gradient(135deg,#0a0a2e,#2000c0,#c9844c)', colors: ['#0a0a2e','#2000c0','#c9844c'] },
  { id:  6, category: 'ceremony',    label: 'The Ceremony',           emoji: '🏆', realSrc: '/465A3459.JPG', gradient: 'linear-gradient(135deg,#1a1a0a,#604010,#c9a84c)', colors: ['#1a1a0a','#604010','#c9a84c'] },
  { id:  7, category: 'ceremony',    label: 'Graduation Day',         emoji: '⭐', realSrc: '/465A3476.JPG', gradient: 'linear-gradient(135deg,#0a1a2e,#104060,#4cc9a8)', colors: ['#0a1a2e','#104060','#4cc9a8'] },
  { id:  8, category: 'ceremony',    label: 'A Dream Come True',      emoji: '✨', realSrc: '/465A3481.JPG', gradient: 'linear-gradient(135deg,#2a0a1a,#901050,#c9a84c)', colors: ['#2a0a1a','#901050','#c9a84c'] },
  { id:  9, category: 'ceremony',    label: 'Diploma in Hand',        emoji: '📋', realSrc: '/465A3496.JPG', gradient: 'linear-gradient(135deg,#0a2a1a,#107040,#c9c84c)', colors: ['#0a2a1a','#107040','#c9c84c'] },
  { id: 10, category: 'ceremony',    label: 'Moment of Glory',        emoji: '🌟', realSrc: '/465A3504.JPG', gradient: 'linear-gradient(135deg,#1a0a2a,#601080,#c94cc9)', colors: ['#1a0a2a','#601080','#c94cc9'] },
  // ---- Family ----
  { id: 11, category: 'family',      label: 'With the Family',        emoji: '❤️', realSrc: '/465A3515.JPG', gradient: 'linear-gradient(135deg,#2e1a0a,#c05020,#c9a84c)', colors: ['#2e1a0a','#c05020','#c9a84c'] },
  { id: 12, category: 'family',      label: 'Parents\' Pride',        emoji: '🙏', realSrc: '/465A3519.JPG', gradient: 'linear-gradient(135deg,#0a2e1a,#106040,#a8c94c)', colors: ['#0a2e1a','#106040','#a8c94c'] },
  { id: 13, category: 'family',      label: 'Family Portrait',        emoji: '👨‍👩‍👧‍👦', realSrc: '/465A3521.JPG', gradient: 'linear-gradient(135deg,#1a0a2e,#501070,#c84cc9)', colors: ['#1a0a2e','#501070','#c84cc9'] },
  { id: 14, category: 'family',      label: 'Unconditional Love',     emoji: '💛', realSrc: '/465A3528.JPG', gradient: 'linear-gradient(135deg,#2e1a00,#c08000,#c9a84c)', colors: ['#2e1a00','#c08000','#c9a84c'] },
  { id: 15, category: 'family',      label: 'Side by Side',           emoji: '🤗', realSrc: '/465A3534.JPG', gradient: 'linear-gradient(135deg,#0a1e2e,#0060a0,#4cc9c8)', colors: ['#0a1e2e','#0060a0','#4cc9c8'] },
  { id: 16, category: 'family',      label: 'Together We Made It',    emoji: '💪', realSrc: '/465A3541.JPG', gradient: 'linear-gradient(135deg,#1a0a0a,#901010,#c9844c)', colors: ['#1a0a0a','#901010','#c9844c'] },
  // ---- Friends ----
  { id: 17, category: 'friends',     label: 'With Best Friends',      emoji: '🤝', realSrc: '/465A3561.JPG', gradient: 'linear-gradient(135deg,#0a1a30,#004080,#4cc9c8)', colors: ['#0a1a30','#004080','#4cc9c8'] },
  { id: 18, category: 'friends',     label: 'Squad Goals',            emoji: '👫', realSrc: '/465A3616.JPG', gradient: 'linear-gradient(135deg,#1a0a10,#801040,#c9844c)', colors: ['#1a0a10','#801040','#c9844c'] },
  { id: 19, category: 'friends',     label: 'Classmates Forever',     emoji: '🎊', realSrc: '/465A3666.JPG', gradient: 'linear-gradient(135deg,#0a1a10,#208040,#c9c94c)', colors: ['#0a1a10','#208040','#c9c94c'] },
  { id: 20, category: 'friends',     label: 'Friends for Life',       emoji: '✊', realSrc: '/465A3675.JPG', gradient: 'linear-gradient(135deg,#2a1a0a,#806020,#c9a84c)', colors: ['#2a1a0a','#806020','#c9a84c'] },
  { id: 21, category: 'friends',     label: 'Shared Journey',         emoji: '🌈', realSrc: '/465A3694.JPG', gradient: 'linear-gradient(135deg,#0a1a2a,#204080,#4cc9c8)', colors: ['#0a1a2a','#204080','#4cc9c8'] },
  { id: 22, category: 'friends',     label: 'Memories Made',          emoji: '📸', realSrc: '/465A3700.JPG', gradient: 'linear-gradient(135deg,#1a0a1a,#601060,#c84cc9)', colors: ['#1a0a1a','#601060','#c84cc9'] },
  // ---- Celebration ----
  { id: 23, category: 'celebration', label: 'Celebration Time',       emoji: '🎉', realSrc: '/465A3726.JPG', gradient: 'linear-gradient(135deg,#2e2a0a,#c0a020,#c9a84c)', colors: ['#2e2a0a','#c0a020','#c9a84c'] },
  { id: 24, category: 'celebration', label: 'Joy and Happiness',      emoji: '🥳', realSrc: '/465A3736.JPG', gradient: 'linear-gradient(135deg,#0a2e2a,#10a080,#4cc9a8)', colors: ['#0a2e2a','#10a080','#4cc9a8'] },
  { id: 25, category: 'celebration', label: 'Pure Joy',               emoji: '😄', realSrc: '/465A3768.JPG', gradient: 'linear-gradient(135deg,#1a2e0a,#60a010,#c9c84c)', colors: ['#1a2e0a','#60a010','#c9c84c'] },
  { id: 26, category: 'celebration', label: 'Smiles All Around',      emoji: '😊', realSrc: '/465A3773.JPG', gradient: 'linear-gradient(135deg,#2e0a2e,#901090,#c94cc9)', colors: ['#2e0a2e','#901090','#c94cc9'] },
  { id: 27, category: 'celebration', label: 'After the Ceremony',     emoji: '🍾', realSrc: '/2026-04-25 18.36.17.jpg', gradient: 'linear-gradient(135deg,#2e1a0a,#c06020,#c9a84c)', colors: ['#2e1a0a','#c06020','#c9a84c'] },
  { id: 28, category: 'celebration', label: 'Celebrating Together',   emoji: '🥂', realSrc: '/2026-04-25 18.36.41.jpg', gradient: 'linear-gradient(135deg,#0a2e1a,#208040,#c9a84c)', colors: ['#0a2e1a','#208040','#c9a84c'] },
  { id: 29, category: 'celebration', label: 'The Party',              emoji: '🎶', realSrc: '/2026-04-25 18.37.02.jpg', gradient: 'linear-gradient(135deg,#0a1a2e,#1060a0,#4cc9c8)', colors: ['#0a1a2e','#1060a0','#4cc9c8'] },
  { id: 30, category: 'celebration', label: 'Golden Moments',         emoji: '✨', realSrc: '/2026-04-25 18.37.12.jpg', gradient: 'linear-gradient(135deg,#2e2a0a,#c0a010,#c9a84c)', colors: ['#2e2a0a','#c0a010','#c9a84c'] },
  { id: 31, category: 'celebration', label: 'We Made It!',            emoji: '🏁', realSrc: '/2026-04-25 18.37.23.jpg', gradient: 'linear-gradient(135deg,#1a0a2e,#501080,#c94cc9)', colors: ['#1a0a2e','#501080','#c94cc9'] },
  { id: 32, category: 'celebration', label: 'Congratulations!',       emoji: '🎊', realSrc: '/2026-04-25 18.37.35.jpg', gradient: 'linear-gradient(135deg,#2a1a0a,#a05020,#c9a84c)', colors: ['#2a1a0a','#a05020','#c9a84c'] },
];

// Pre-generate SVG data URLs so the lightbox always has valid src values
GALLERY_IMAGES.forEach(img => {
  img.svgSrc = makeSvg(img.colors, img.emoji);
});

/* --------------------------------------------------
   SLIDESHOW SLIDES
   -------------------------------------------------- */
export const SLIDES = [
  { realSrc: '/465A3383.JPG', emoji: '🎓', gradient: 'linear-gradient(135deg,#1a0a2e,#4a1060,#c9a84c)', title: 'The Journey Complete', subtitle: 'Years of dedication finally rewarded' },
  { realSrc: '/465A3515.JPG', emoji: '❤️', gradient: 'linear-gradient(135deg,#2e1a0a,#c05020,#c9a84c)', title: 'Family & Love', subtitle: 'Those who stood by through every challenge' },
  { realSrc: '/465A3561.JPG', emoji: '🤝', gradient: 'linear-gradient(135deg,#0a1a30,#004080,#4cc9c8)', title: 'Friends Forever', subtitle: 'A bond formed through shared struggle and triumph' },
  { realSrc: '/465A3726.JPG', emoji: '🎉', gradient: 'linear-gradient(135deg,#2e2a0a,#c0a020,#c9a84c)', title: 'Time to Celebrate', subtitle: 'The day dreams became permanent reality' },
  { realSrc: '/465A3773.JPG', emoji: '🌟', gradient: 'linear-gradient(135deg,#2e0a2e,#901090,#c94cc9)', title: 'The Future is Bright', subtitle: 'Dr. Gutu Amanuel — ready to change the world' },
];

/* --------------------------------------------------
   TIMELINE
   -------------------------------------------------- */
export const TIMELINE = [
  { year: '2018', title: 'The Beginning', text: 'Started an incredible academic journey with passion and determination, enrolling in a prestigious program ready to change the world.' },
  { year: '2020', title: 'Rising Through Challenges', text: 'Through difficult times including a global pandemic, remained focused and dedicated — a true testament to resilience and character.' },
  { year: '2022', title: 'Research & Recognition', text: 'Published breakthrough research and received academic accolades. The relentless hard work was beginning to pay off in extraordinary ways.' },
  { year: '2024', title: 'Final Chapters', text: 'Completing the dissertation with distinction, preparing for the most important day — the day a dream becomes permanent reality.' },
  { year: '2026', title: '🎓 Dr. Gutu Amanuel', text: 'The dream is real. Today we celebrate not just a degree, but a life transformed and countless lives ready to be changed forever.', gold: true },
];

/* --------------------------------------------------
   DEFAULT GUESTBOOK MESSAGES
   -------------------------------------------------- */
export const DEFAULT_MESSAGES = [
  {
    id: 'seed-1', name: 'The Family', relation: 'Family', emoji: '❤️',
    message: 'We are so incredibly proud of you, Gutu! This journey was not easy, but you never gave up. Today, you prove that dreams are possible with hard work, faith, and love. We love you more than words can say.',
    time: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'seed-2', name: 'Your Best Friend', relation: 'Friend', emoji: '🎉',
    message: 'From late-night study sessions to this incredible milestone — I have watched you work so hard for this moment. Congratulations, Doctor! The world is so lucky to have you.',
    time: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'seed-3', name: 'A Proud Colleague', relation: 'Colleague', emoji: '🏆',
    message: 'Your passion, dedication, and brilliance have always been an inspiration to everyone around you. Congratulations Dr. Gutu — this is just the beginning of an amazing career!',
    time: new Date(Date.now() - 7200000).toISOString(),
  },
];
