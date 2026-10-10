/** Window stacking order, bottom first. */
export type Stack<Id extends string> = readonly Id[];

const BASE_Z = 10;

export function raise<Id extends string>(order: Stack<Id>, id: Id): Stack<Id> {
  if (order[order.length - 1] === id) return order;
  return [...order.filter((w) => w !== id), id];
}

export function zIndex<Id extends string>(order: Stack<Id>, id: Id): number {
  return BASE_Z + Math.max(0, order.indexOf(id));
}
