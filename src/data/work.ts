// Work history for "A bit about me". Every claim comes from the resume (Sep 2026).
// Employers are named; Ford project details stay general (no product names, no figures), at the author's request.
export type Work = { title: string; org: string; when: string; problem: string; approach: string; outcome: string };

export const work: Work[] = [
  {
    title: 'Document intelligence for supplier quality reviews',
    org: 'Ford',
    when: '2026',
    problem: 'Engineers spend hours checking each supplier submission by hand, and the documents arrive in many formats.',
    approach: 'Found the accuracy limit was in parsing the documents, not in the model. Made extraction deterministic and gave each field a confidence score.',
    outcome: 'Engineers can see why a field failed. It is now in trial with them.',
  },
  {
    title: 'An audit agent with a human sign-off',
    org: 'Ford',
    when: '2026',
    problem: 'Checking invoices, orders and proofs of payment across several systems took hours, so only part of the spend was covered.',
    approach: 'An agent gathers and cross-checks the evidence. Because the output moves money, an auditor signs off on every audit.',
    outcome: 'Review effort went from hours to minutes per audit. In pilot.',
  },
  {
    title: 'AI tools for teams outside engineering',
    org: 'Ford',
    when: '2026',
    problem: 'Marketing, finance and HR had nothing like the AI tools developers already use.',
    approach: 'A notebook and chat over internal documents and data, built for non-technical teams.',
    outcome: 'Live. Their feedback is moving the roadmap toward generated documents and workflow automation.',
  },
  {
    title: 'A self-service LLM assistant for data investigations',
    org: 'JP Morgan Chase',
    when: '2023 – 2026',
    problem: 'Analysts waited on central data teams whenever they needed to investigate a data question.',
    approach: 'An LLM assistant that analysts use to run those investigations themselves.',
    outcome: 'Resolution time went from hours to minutes for 50+ analysts.',
  },
  {
    title: 'Predictive detection of operational anomalies',
    org: 'JP Morgan Chase',
    when: '2023 – 2026',
    problem: 'Daily operational anomalies ran above 1,000 and risked settlement failures.',
    approach: 'Designed a predictive detection workflow to catch them earlier.',
    outcome: 'Daily anomalies fell 80%, from 1,000+ to 200.',
  },
];

export const timeline = [
  { when: '2026 –', role: 'Senior Product Manager, AI', org: 'Ford' },
  { when: '2023 – 26', role: 'Technical Product Manager', org: 'JP Morgan Chase' },
  { when: '2021 – 23', role: 'Associate Technical PM, Data Platform', org: 'JP Morgan Chase' },
  { when: '2018 – 21', role: 'Software Engineer', org: 'JP Morgan Chase' },
];
