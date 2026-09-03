// Given a list already sorted in display order, moves the item with `id` one
// slot up/down and returns a full { id, order } renumbering (0..N-1) to
// persist. Renumbering everything (rather than swapping just two `order`
// values) keeps this correct even when items share the same default order.
export function reorderList<T extends { id: string }>(
  items: T[],
  id: string,
  direction: "up" | "down"
): { id: string; order: number }[] | null {
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return null;

  const reordered = [...items];
  [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

  return reordered.map((item, i) => ({ id: item.id, order: i }));
}
