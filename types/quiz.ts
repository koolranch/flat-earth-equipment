// types/quiz.ts
export type BaseItem = { 
  id: string; 
  type: string; 
  question: string; 
  explanation?: string;
};

export type HotspotItem = BaseItem & { 
  type: 'hotspot'; 
  targets: { id: string; label: string }[]; 
  correct: string[];
};

export type OrderItem = BaseItem & { 
  type: 'order'; 
  options: string[]; 
  correctOrder: string[];
};

export type DragItem = BaseItem & { 
  type: 'drag'; 
  pairs: { left: string; right: string }[];
};

export type MultipleChoiceItem = BaseItem & {
  type: 'multiple-choice';
  choices: string[];
  answer: number;
};

export type AnyItem = HotspotItem | OrderItem | DragItem | MultipleChoiceItem | BaseItem;
