import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { moveArray, getDragStateZIndex, calculateSwapDistance } from "../utils";
import {
  useDynamicList,
  useDynamicListItem,
  DynamicListItemProps
} from "../dynamic";
import { useItems } from "../App";

type DynamicSizeItemProps = {
  index: number;
  height: number;
  color: string;
  itemProps: DynamicListItemProps;
};

function DynamicSizeItem({
  index,
  height,
  color,
  itemProps
}: DynamicSizeItemProps) {
  const [dragState, ref, eventHandlers] = useDynamicListItem<HTMLDivElement>(
    index,
    "y",
    itemProps
  );

  return (
    <li
      style={{
        padding: 0,
        height,
        // If we're dragging, we want to set the zIndex of that item to be on top of the other items.
        zIndex: getDragStateZIndex(dragState)
      }}
    >
      <motion.div
        layout
        initial={false}
        drag="y"
        ref={ref}
        style={{
          background: color,
          height,
          borderRadius: 5
        }}
        whileHover={{
          scale: 1.03,
          boxShadow: "0px 3px 3px rgba(0,0,0,0.15)"
        }}
        whileTap={{
          scale: 1.12,
          boxShadow: "0px 5px 5px rgba(0,0,0,0.1)"
        }}
        {...eventHandlers}
      />
    </li>
  );
}

export default function FixedSizeList() {
  const [items, setItems] = useItems();
  const onPositionUpdate = useCallback(
    (startIndex: number, endIndex: number) => {
      setItems(moveArray(items, startIndex, endIndex));
    },
    [items, setItems]
  );

  const props = useDynamicList({
    items,
    swapDistance: calculateSwapDistance,
    onPositionUpdate
  });

  return (
    <ul>
      {items.map((item, i) => (
        <DynamicSizeItem
          key={item.id}
          height={item.height}
          color={item.color}
          index={i}
          itemProps={props}
        />
      ))}
    </ul>
  );
}
