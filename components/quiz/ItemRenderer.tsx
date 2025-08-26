// components/quiz/ItemRenderer.tsx
import React from "react";
import { HotspotItem } from "./items/HotspotItem";
import { OrderItem } from "./items/OrderItem";
import { DragDropItem } from "./items/DragDropItem";
import type { AnyItem } from "@/types/quiz";

interface ItemRendererProps {
  item: AnyItem;
  onAnswer: (result: { correct: boolean; choice: any }) => void;
}

export function ItemRenderer({ item, onAnswer }: ItemRendererProps) {
  switch (item.type) {
    case 'hotspot':
      return <HotspotItem item={item as any} onAnswer={onAnswer} />;
    case 'order':
      return <OrderItem item={item as any} onAnswer={onAnswer} />;
    case 'drag':
      return <DragDropItem item={item as any} onAnswer={onAnswer} />;
    case 'multiple-choice':
      // Fallback to legacy multiple choice rendering
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#0F172A]">{item.question}</h3>
          <div className="text-sm text-slate-600">
            Legacy multiple choice format - please use the standard quiz interface
          </div>
        </div>
      );
    default:
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#0F172A]">{item.question}</h3>
          <div className="text-sm text-red-600">
            Unknown item type: {item.type}
          </div>
        </div>
      );
  }
}
