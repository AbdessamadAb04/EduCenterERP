let counter = 1000;

export function generateId(): number {
  counter += 1;
  return counter;
}
