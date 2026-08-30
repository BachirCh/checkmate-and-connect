/**
 * Seed the homepage image collections from assets already uploaded to Cloudinary.
 *
 * Idempotent: documents use deterministic _id values, so re-running updates in
 * place rather than creating duplicates.
 *
 * IDs use hyphens, not dots. Sanity treats a dotted _id as a private system
 * document and silently omits it from ordinary `*[_type == ...]` queries — the
 * write succeeds and the document is simply never returned.
 *
 *   node --env-file=.env.local scripts/seed-content.mjs
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Upload manifest written by the Cloudinary upload step. Reading versions from
 * here rather than hardcoding them means a re-upload can never silently leave
 * the CMS pointing at a stale version of an asset.
 */
const here = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(here, 'seed-assets.json'), 'utf8'));
const byPublicId = new Map(manifest.map((a) => [a.public_id, a]));

function fromManifest(publicId) {
  const a = byPublicId.get(publicId);
  if (!a) throw new Error(`"${publicId}" is not in seed-assets.json — re-run the Cloudinary upload.`);
  return a;
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/** Build the `cloudinary.asset` payload the Studio plugin expects. */
function asset(publicId) {
  const { public_id, version, format, width, height, resource_type } = fromManifest(publicId);
  const base = `res.cloudinary.com/${CLOUD}/image/upload/v${version}/${public_id}.${format}`;
  return {
    _type: 'cloudinary.asset',
    public_id,
    resource_type: resource_type || 'image',
    type: 'upload',
    format,
    version,
    width,
    height,
    url: `http://${base}`,
    secure_url: `https://${base}`,
  };
}

// Array order becomes the `order` field, which is what the band sorts on. The
// band fits four per row on desktop, so this reads as two deliberate lines.
const LOGOS = [
  { slug: 'ocp', name: 'OCP' },
  { slug: 'um6p', name: 'UM6P' },
  { slug: 'cgem', name: 'CGEM' },
  { slug: 'oracle', name: 'Oracle' },
  { slug: 'sobrus', name: 'Sobrus' },
  { slug: 'yassir', name: 'Yassir' },
  { slug: 'datao', name: 'Datao' },
  { slug: 'aress', name: 'Aress' },
];

// eventDate is set only for the hackathon set, which is dated from the event
// artwork (8-9 August 2026). The two Commons photos are undated on purpose —
// guessing a date would put a false fact in the CMS.
const PAST_EVENTS = [
  { slug: 'group-celebration', date: '2026-08-09',
    caption: 'The whole room cheering with hands raised under the pendant lights at the end of the hackathon.' },
  { slug: 'talk-audience', date: '2026-08-08',
    caption: 'A full audience seated and listening during a talk at Commons Zerktouni.' },
  { slug: 'jenga-tower', date: '2026-08-08',
    caption: 'A member carefully pulling a block from a giant Jenga tower while others watch.' },
  { slug: 'networking-room', date: '2026-08-08',
    caption: 'A packed room of founders and builders standing and talking between sessions.' },
  { slug: 'branded-bottles', date: '2026-08-08',
    caption: 'Checkmate & Connect branded water bottles lined up along the bar.' },
  { slug: 'hackathon-stage', date: '2026-08-08',
    caption: 'A speaker presenting in front of the Supply Chain Hackathon screen.' },
  { slug: 'table-game', date: '2026-08-08',
    caption: 'A group playing a stacking game together at a long wooden table.' },
  { slug: 'crowd-terrace', date: null,
    caption: 'Members talking around tables on the shaded terrace at Commons Zerktouni.' },
  { slug: 'commons-neon', date: null,
    caption: 'The Commons Zerktouni neon sign reading "Commons work wonders" on a plant wall.' },
  { slug: 'standing-circle', date: '2026-08-08',
    caption: 'Members standing in a circle mid-conversation during a break.' },
];

const TESTIMONIALS = [
  {
    slug: 'bachir-cherrat',
    quote: 'Life is a game. Make your move with other players in mind.',
    authorName: 'Bachir Cherrat',
    authorRole: 'UX Designer · OCP · Board member',
  },
  {
    slug: 'abdelkbir-nainiaa',
    quote:
      "Managing isn't about keeping control of every decision. It's about creating the conditions for a team to find, together, a better answer than the one you walked in with.",
    authorName: 'Abdelkbir Nainiaa',
    authorRole: 'QA Engineer',
  },
  {
    slug: 'ismail-dachraoui',
    quote:
      'Sometimes, one idea, one connection, or one conversation can completely change the direction of a project.',
    authorName: 'Ismail Dachraoui',
    authorRole: 'Engineering Student, ENSA Khouribga · Digital manager',
  },
  {
    slug: 'calina-hasegawa',
    quote: "We're such a bunch of different people with a common vision.",
    authorName: 'Calina Hasegawa',
    authorRole: 'Digital and People Operations',
  },
  {
    slug: 'kawtar-ait-el-haj',
    quote: 'Growth begins where our expertise ends.',
    authorName: 'Kawtar AIT EL HAJ',
    authorRole: 'Founder & Managing Director · Strategy & Market Expansion',
  },
  {
    slug: 'amina-fatima-duo',
    quote:
      "You only find your real limits by stepping into rooms where you're not already comfortable. Technology doesn't live in one field, and neither should we.",
    authorName: 'Amina AMJOUNE & Fatima Ezzahra EL HASNAOUI',
    authorRole: 'Cybersecurity Engineers',
  },
];

const docs = [
  ...LOGOS.map((l, i) => ({
    _id: `logo-${l.slug}`,
    _type: 'logo',
    name: l.name,
    order: i + 1,
    image: asset(`checkmate/logos/${l.slug}`),
  })),
  ...PAST_EVENTS.map((e, i) => ({
    _id: `pastEvent-${e.slug}`,
    _type: 'pastEvent',
    caption: e.caption,
    ...(e.date ? { eventDate: e.date } : {}),
    order: i + 1,
    image: asset(`checkmate/past-events/${e.slug}`),
  })),
  ...TESTIMONIALS.map((t, i) => ({
    _id: `testimonial-${t.slug}`,
    _type: 'testimonial',
    quote: t.quote,
    authorName: t.authorName,
    authorRole: t.authorRole,
    order: i + 1,
    image: asset(`checkmate/testimonials/${t.slug}`),
  })),
];

const tx = docs.reduce((t, doc) => t.createOrReplace(doc), client.transaction());
const result = await tx.commit();
console.log(`Seeded ${result.results.length} documents:`);
for (const r of result.results) console.log(`  ${r.id}`);
