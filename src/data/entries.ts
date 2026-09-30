// Journal entries. Each Playbook post is a self-contained folder built by publish/build_blog.py;
// copy it to public/journal/<slug>/ and add one line here. Newest first.
export type Entry = { slug: string; title: string; date: string; summary: string; series?: string };

export const entries: Entry[] = [];
