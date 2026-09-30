// Selected work. Every claim comes from the resume (Sep 2026).
// Ford work is abstracted at the author's request: no product names, no figures, no identifying detail.
// Row labels are plain English (style bible 9.7). A row with no source is left out, never filled in.

export type Work = {
  org: string;
  when: string;
  status?: string;
  title: string;
  problem: string;
  noticed?: string;
  built: string;
  now: string;
};

export const work: Work[] = [
  {
    org: 'Automaker',
    when: '2026',
    status: 'In trial with engineers',
    title: 'Document intelligence for supplier quality reviews',
    problem:
      'Engineers spend hours checking each supplier approval submission by hand, and the documents arrive in many formats.',
    noticed:
      'The accuracy ceiling was reading the documents, not the model’s reasoning.',
    built:
      'I made extraction deterministic and gave every field a confidence score, so an engineer sees why a field failed instead of trusting a black box.',
    now:
      'The first version covers only the checks tied to the most costly quality failures, and engineers are now trying it on real submissions.',
  },
  {
    org: 'Automaker',
    when: '2026',
    status: 'In pilot',
    title: 'An agentic audit that keeps a person in charge',
    problem:
      'Auditing tooling spend meant cross-checking invoices, purchase orders and proofs of payment across several internal systems, so only part of the spend was covered.',
    noticed:
      'The output moves money, so the system should gather the evidence and the auditor should make the decision.',
    built:
      'An agent parses and cross-references the documents, and every audit still needs an auditor’s sign-off.',
    now:
      'Review effort went from hours to minutes per audit, and coverage is growing toward all of the spend.',
  },
  {
    org: 'Automaker',
    when: '2026',
    status: 'Live',
    title: 'A retrieval platform for teams outside engineering',
    problem:
      'Marketing, finance and HR teams had nothing like the AI tools that developers already use.',
    built:
      'A notebook and chat over the company’s internal documents and data, aimed deliberately at non-technical teams.',
    now:
      'People use it every month, and their feedback is moving the roadmap from chat toward generated documents and workflow automation.',
  },
  {
    org: 'Global bank',
    when: '2023 – 2026',
    title: 'A self-service LLM assistant for data investigations',
    problem:
      'Analysts waited on central data teams whenever they needed to investigate a data question.',
    built: 'A self-service LLM assistant that analysts use to run those investigations themselves.',
    now:
      'Resolution time went from hours to minutes for 50+ analysts, and the standing dependency on central data teams went away.',
  },
  {
    org: 'Global bank',
    when: '2023 – 2026',
    title: 'Ripple, an ML-driven ROI analytics platform',
    problem: 'Teams needed a way to show the return on their technology work.',
    built:
      'I led a cross-functional team of 8 across data science, engineering and UX, and we shipped the platform in 6 months.',
    now:
      'It secured 3 pilot teams, I set the roadmap for firm-wide rollout, and it was a finalist for the firm-wide Innovation Award.',
  },
];
