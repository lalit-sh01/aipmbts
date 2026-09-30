// The Lab: things built at night. Descriptions come from the resume (Sep 2026).
export type LabItem = { name: string; summary: string; detail: string; tags: string[]; link?: string };

export const lab: LabItem[] = [
  {
    name: 'Compass.ai',
    summary: 'A learning platform that personalises your roadmap and tries to stop skills from fading.',
    detail:
      'Roadmaps adapt as you learn. A multi-agent setup in LangGraph, with retrieval (RAG), generates the curriculum as you go.',
    tags: ['LangGraph', 'RAG', 'Agents'],
  },
  {
    name: 'Privacy-first file organiser',
    summary: 'A macOS tool that organises your files with an AI model running on your own machine.',
    detail:
      'It runs locally through Ollama, so your files never leave the laptop. Batching and parallel processing gave it a 10x performance improvement.',
    tags: ['Ollama', 'Local AI', 'macOS'],
  },
];
