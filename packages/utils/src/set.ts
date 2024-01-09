export const findSetEffects = (prev: Set<string>, next: Set<string>) => {
  const effects: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];
  prev.forEach(id => {
    if (!next.has(id)) removed.push(id);
  });
  next.forEach(id => {
    if (!prev.has(id)) added.push(id);
  });
  effects.push(...added, ...removed);
  return { effects, added, removed };
};
