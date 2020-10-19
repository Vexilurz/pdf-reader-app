export const splitTriple = (start, end) => (x) => [
  x.slice(0, start),
  x.slice(start, end),
  x.slice(end),
];

export const splitDuo = (due) => (x) => [x.slice(0, due), x.slice(due)];
