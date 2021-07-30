import {
  useState,
  useRef,
  useEffect,
  useCallback,
  MutableRefObject
} from "react";
import { PanInfo, AxisBox2D, BoxDelta } from "framer-motion";

type SwapDistanceType = (sibling: number) => number;

export type DynamicListItem = {
  index: number;
  drag?: "x" | "y";
};

export const findIndex = (
  i,
  yOffset,
  sizes,
  swapDistance: SwapDistanceType
) => {
  let target = i;

  // If moving down
  if (yOffset > 0) {
    const nextHeight = sizes[i + 1];
    if (nextHeight === undefined) return i;

    const swapOffset = swapDistance(nextHeight);
    if (yOffset > swapOffset) target = i + 1;

    // If moving up
  } else if (yOffset < 0) {
    const prevHeight = sizes[i - 1];
    if (prevHeight === undefined) return i;

    const swapOffset = swapDistance(prevHeight);
    if (yOffset < -swapOffset) target = i - 1;
  }

  return Math.min(Math.max(target, 0), sizes.length);
};

export type DynamicListProps<T> = {
  items: T[];
  swapDistance: SwapDistanceType;
  onPositionUpdate: (from: number, to: number) => void;
  onPositionChange?: (startIndex: number, endIndex) => void;
};

export type DynamicListItemProps = {
  handleChange: (i: number, dragOffset: number) => void;
  handleDragStart: (index: number) => void;
  handleDragEnd: (endIndex: number) => void;
  handleMeasure: (index: number, size: number) => void;
};

export function useDynamicList<T>({
  items,
  swapDistance,
  onPositionUpdate,
  onPositionChange
}: DynamicListProps<T>): DynamicListItemProps {
  const sizes = useRef(new Array(items.length).fill(0)).current;
  const [startIndex, handleDragStart] = useState(-1);

  const handleChange = useCallback(
    (i: number, dragOffset: number) => {
      const targetIndex = findIndex(i, dragOffset, sizes, swapDistance);
      if (targetIndex !== i) {
        const swapSize = sizes[targetIndex];
        sizes[targetIndex] = sizes[i];
        sizes[i] = swapSize;

        onPositionUpdate(i, targetIndex);
      }
    },
    [sizes, swapDistance, onPositionUpdate]
  );

  const handleDragEnd = useCallback(
    (endIndex: number) => {
      if (onPositionChange && startIndex !== endIndex)
        onPositionChange(startIndex, endIndex);
      handleDragStart(-1);
    },
    [startIndex, onPositionChange]
  );

  const handleMeasure = useCallback(
    (index: number, size: number) => {
      sizes[index] = size;
    },
    [sizes]
  );

  return {
    handleChange,
    handleDragStart,
    handleDragEnd,
    handleMeasure
  };
}

type DragState = "idle" | "animating" | "dragging";

type DynamicListItemResult<T> = [
  DragState,
  MutableRefObject<T>,
  {
    onDragStart(
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ): void;
    onDragEnd(
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ): void;
    onAnimationComplete(): void;
    onViewportBoxUpdate(box: AxisBox2D, delta: BoxDelta): void;
  }
];

export function useDynamicListItem<T extends HTMLElement>(
  index: number,
  drag: "x" | "y",
  {
    handleChange,
    handleDragStart,
    handleDragEnd,
    handleMeasure
  }: DynamicListItemProps
): DynamicListItemResult<T> {
  const [state, setState] = useState<DragState>("idle");
  const ref = useRef(null);

  useEffect(() => {
    if (ref && ref.current)
      handleMeasure(
        index,
        drag === "y" ? ref.current.offsetHeight : ref.current.offsetWidth
      );
  }, [ref, handleMeasure, index, drag]);

  return [
    state,
    ref,
    {
      onDragStart: () => {
        setState("dragging");
        handleDragStart(index);
      },
      onDragEnd: () => {
        setState("animating");
        handleDragEnd(index);
      },
      onAnimationComplete: () => {
        if (state === "animating") setState("idle");
      },
      onViewportBoxUpdate: (_viewportBox, delta) => {
        if (state === "dragging") handleChange(index, delta.y.translate);
      }
    }
  ];
}
