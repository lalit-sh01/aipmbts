// Late-night builds. From the resume (Sep 2026). A field left out is not shown; nothing is filled in by guesswork.
export type Build = {
  name: string;
  tags: string[];
  status?: string;
  problem: string;
  approach: string;
  outcome?: string;
  link?: string;
};

export const builds: Build[] = [
  {
    name: 'Compass.ai',
    tags: ['LangGraph', 'RAG', 'Agents'],
    problem: 'Skills fade when you stop using them, and most learning roadmaps don’t adapt to you.',
    approach: 'A multi-agent setup in LangGraph, with retrieval (RAG), that generates the curriculum as you learn.',
    outcome: 'Still in progress. A first pilot is planned for early 2027, with product managers moving into AI product management.',
  },
  {
    name: 'Privacy-first file organiser',
    tags: ['Ollama', 'Local AI', 'macOS'],
    problem: 'Organising files with AI usually means sending them to someone else’s server.',
    approach: 'An AI model that runs on your own Mac through Ollama, with batching and parallel processing.',
    outcome: 'A 10x performance improvement, and your files never leave the laptop.',
  },
];
