// All site copy lives here so it can be edited in one place.

export const site = {
  name: 'Kinetik',
  tagline: 'Motion & Video Studio',
  email: 'hello@kinetik.studio',
  bookingUrl: '/contact',
  location: 'London · Remote worldwide',
  socials: [
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'Vimeo', href: 'https://vimeo.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
  ],
};

export const categories = [
  { id: 'saas', label: 'SaaS Videos' },
  { id: 'reels', label: 'Reels & Social' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'events', label: 'Events' },
  { id: 'editing', label: 'Video Editing' },
];

export const categoryLabel = (id) => categories.find((c) => c.id === id)?.label ?? id;

export const services = [
  {
    id: 'saas',
    title: 'SaaS & Product Videos',
    summary: 'Launch films, explainers and UI walkthroughs that make complex software feel obvious.',
    points: ['Product launch films', 'Explainer videos', 'UI / feature animations', 'Onboarding & tutorials'],
  },
  {
    id: 'reels',
    title: 'Reels & Social Content',
    summary: 'Scroll-stopping vertical edits built for Instagram, TikTok, Shorts and LinkedIn.',
    points: ['Short-form reels', 'Kinetic captions', 'Content repurposing', 'Monthly content packs'],
  },
  {
    id: 'cinematic',
    title: 'Cinematic Films',
    summary: 'Brand films and trailers with story-led editing, colour grading and sound design.',
    points: ['Brand films & trailers', 'Colour grading', 'Sound design & mix', 'Music-driven edits'],
  },
  {
    id: 'events',
    title: 'Event Videos',
    summary: 'Conferences, launches and weddings — from highlight reels to same-day edits.',
    points: ['Event highlight reels', 'Same-day edits', 'Speaker & keynote cuts', 'Weddings & private events'],
  },
  {
    id: 'editing',
    title: 'Video Editing',
    summary: 'Send us the footage. We handle the story, pacing, graphics, colour and audio.',
    points: ['Long & short-form editing', 'Motion graphics overlays', 'Podcast & YouTube edits', 'Ads & promos'],
  },
];

export const tools = ['After Effects', 'Premiere Pro', 'DaVinci Resolve', 'Cinema 4D', 'Blender', 'Figma', 'Illustrator', 'Audition'];

export const stats = [
  { value: '120+', label: 'Projects delivered' },
  { value: '60+', label: 'Happy clients' },
  { value: '35M', label: 'Views generated' },
  { value: '48h', label: 'First draft turnaround' },
];

export const process = [
  { step: '01', title: 'Discovery', text: 'A short call to understand your goal, audience and where the video will live.' },
  { step: '02', title: 'Script & storyboard', text: 'We write the message and sketch every frame before a single keyframe is set.' },
  { step: '03', title: 'Production', text: 'Animation, editing, colour and sound — with progress shared along the way.' },
  { step: '04', title: 'Delivery', text: 'Final files in every format you need, from 16:9 to 9:16, ready to publish.' },
];

export const pricing = [
  {
    name: 'Single Project',
    price: 'From £1,500',
    note: 'per video',
    description: 'One clear deliverable with a fixed scope and timeline.',
    features: ['Script & storyboard', 'Animation or edit', 'Licensed music & SFX', '2 revision rounds', 'All aspect ratios'],
    cta: 'Start a project',
  },
  {
    name: 'Monthly Retainer',
    price: 'From £3,500',
    note: 'per month',
    description: 'A dedicated motion team for brands that need content every week.',
    features: ['Priority turnaround', 'Unlimited requests, one at a time', 'Reels, ads & product videos', 'Dedicated project lead', 'Pause or cancel anytime'],
    cta: 'Book a call',
    highlighted: true,
  },
  {
    name: 'Events',
    price: 'From £900',
    note: 'per day',
    description: 'Filming and editing for conferences, launches and private events.',
    features: ['On-site crew', 'Highlight reel', 'Same-day edit option', 'Speaker cut-downs', 'Social versions'],
    cta: 'Check availability',
  },
];

export const testimonials = [
  {
    quote: 'They understood our product faster than some of our own hires. The launch video did more for sign-ups than any campaign we ran that year.',
    name: 'Maya Patel',
    role: 'Head of Marketing, Flowdesk',
  },
  {
    quote: 'Fast, calm and incredibly detailed. We send raw footage on Monday and have reels ready by Wednesday.',
    name: 'Daniel Okafor',
    role: 'Founder, Northline Coffee',
  },
  {
    quote: 'The same-day recap was on screen before the closing keynote ended. The room actually applauded.',
    name: 'Sofia Lind',
    role: 'Events Director, Kova Summit',
  },
];

export const clients = ['Flowdesk', 'Ledgerly', 'Northline', 'Atlas', 'Kova', 'Brightpath', 'Orbit', 'Lumen'];

export const faqs = [
  {
    q: 'How long does a project take?',
    a: 'Most SaaS videos take 2–4 weeks from kickoff to final delivery. Reels and edits are usually turned around in 2–5 working days.',
  },
  {
    q: 'Do you write the script?',
    a: 'Yes. Scripting and storyboarding are included in every animated project — or we can work from your own script.',
  },
  {
    q: 'How many revisions do I get?',
    a: 'Every project includes two rounds of revisions at each key stage (script, storyboard, animation). Retainer clients get unlimited requests.',
  },
  {
    q: 'Can you work with our brand guidelines?',
    a: 'Absolutely. We build every video around your typography, colours and tone of voice so it feels native to your brand.',
  },
  {
    q: 'What do you need from us to start?',
    a: 'A short brief, your brand assets and — for edits — the raw footage. We will guide you through everything else on the kickoff call.',
  },
];
