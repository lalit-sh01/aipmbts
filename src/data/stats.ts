// Every number on the site lives here, copied word for word from its source.
// Rule: no rounding, no rewording, no number without a source. Ranges stay ranges; "~" stays "~".
// Source key R = Resume_Lalit_Shewani_2026_v3.pdf (Sep 2026).
// Ford figures are deliberately absent: the author asked for Ford work to be described without specifics.

export type Stat = { value: string; label: string; source: string };

export const homeStats: Stat[] = [
  {
    value: '80%',
    label: 'fewer daily operational anomalies, from 1,000+ to 200, through a predictive detection workflow',
    source: 'R · JP Morgan Chase · "Cut daily operational anomalies 80% (1,000+ to 200)"',
  },
  {
    value: '45 → 10 days',
    label: 'to integrate a new upstream system, after a standard onboarding framework',
    source: 'R · JP Morgan Chase · "cut upstream integration time from 45 to 10 days"',
  },
  {
    value: '1M+',
    label: 'trades a day on the platform whose roadmap I owned, alongside 10M valuations',
    source: 'R · JP Morgan Chase · "platform processing 1M+ daily trades and 10M valuations"',
  },
  {
    value: '50 → 500+',
    label: 'people at the Bengaluru PM community events I founded, over two years',
    source: 'R · Leadership · "growing attendance from 50 to 500+ professionals across 2 years"',
  },
];
