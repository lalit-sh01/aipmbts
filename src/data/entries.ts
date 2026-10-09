// Product lessons: the AI Product Playbook cases, as cards.
// When a post is published, copy its built folder to public/lessons/<slug>/ and set `published: true`.
// Lenses show which sides a lesson touches. They were proposed, not confirmed; the author can change them.
export type Lens = 'Technology' | 'Leadership' | 'Users';
export type Lesson = {
  slug: string;
  entry: string;
  stage: string;
  title: string;
  summary: string;
  lenses: Lens[];
  published: boolean;
  date?: string;
};

export const lessons: Lesson[] = [
  {
    slug: 'design-partner-changes-direction',
    entry: 'Entry 001',
    stage: 'Frame',
    title: 'Your design partner keeps changing what they want',
    summary: 'Most changes fall into five kinds of request, and each kind needs a different response.',
    lenses: ['Leadership', 'Users'],
    published: true,
  },
  {
    slug: 'parser-fails-on-real-documents',
    entry: 'Entry 002',
    stage: 'Prove',
    title: 'Your AI worked in the demo but struggles with real documents',
    summary: 'Decide which documents you promise to read, how they are captured, and who checks the rest.',
    lenses: ['Technology', 'Users'],
    published: true,
  },
  {
    slug: 'teams-go-around-the-platform',
    entry: 'Entry 003',
    stage: 'Launch',
    title: 'Teams go around the AI platform you built',
    summary: 'There are usually three reasons. It helps to find yours before reaching for a mandate.',
    lenses: ['Technology', 'Leadership', 'Users'],
    published: true,
  },
];

// How the tech really works: technical posts. Empty until the first one is written.
// Tech notes: import with `node tools/import-post.mjs <blog folder> <slug> tech`, then add an entry here.
export type TechPost = { slug: string; title: string; summary: string; date?: string };
export const techPosts: TechPost[] = [];
