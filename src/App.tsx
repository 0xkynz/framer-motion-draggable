import React, { createContext, useContext, useState } from "react";
import DynamicSizeList from "./components/DynamicSizeList";
import "./styles.css";

/**
 * This is an example of drag-to-reorder in Framer Motion 3.
 *
 * Fixed size version: https://codesandbox.io/s/framer-motion-2-drag-to-reorder-forked-njcdl
 * Virtual list version: https://codesandbox.io/s/framer-motion-2-drag-to-reorder-fixed-size-forked-kxnb7
 */

export type ItemType = {
  id: number;
  color: string;
  height: number;
};

const ItemsContext = createContext<
  [ItemType[], (setItems: ItemType[]) => void]
>([[], (_) => null]);

export default function App() {
  const [items, setItems] = useState<ItemType[]>(() => [
    { id: 1, color: "#A30006", height: 60 },
    { id: 2, color: "#2A6E78", height: 70 },
    { id: 3, color: "#6E1E62", height: 80 },
    { id: 4, color: "#DE4126", height: 90 }
  ]);

  return (
    <ItemsContext.Provider value={[items, setItems]}>
      <DynamicSizeList />
    </ItemsContext.Provider>
  );
}

export const useItems = () => useContext(ItemsContext);
