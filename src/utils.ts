export function moveArray<T>(items: T[], startIndex: number, endIndex: number) {
  const clone = [...items];
  clone[endIndex] = items[startIndex];
  clone[startIndex] = items[endIndex];
  return clone;
}

export const calculateSwapDistance = (sibling: number) => sibling;

export const getDragStateZIndex = (state: string, base = 0) => {
  switch (state) {
    case "dragging":
      return base + 3;
    case "animating":
      return base + 2;
    default:
      return base + 1;
  }
};
