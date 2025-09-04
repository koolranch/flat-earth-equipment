// components/DemoPanel.tsx
"use client";
import React from "react";
import { analytics } from "@/lib/analytics";
import { useT } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DemoPanelProps = {
  title: string;
  objective: string;
  steps: string[];
  onStart?: () => void;
  onComplete?: (result?: unknown) => void;
  children: React.ReactNode;
};

export function DemoPanel({ title, objective, steps, onStart, onComplete, children }: DemoPanelProps) {
  const t = useT();
  
  const handleStart = () => {
    analytics.track("demo_start", { demo: title });
    onStart?.();
  };

  const handleComplete = (result?: unknown) => {
    analytics.track("demo_complete", { demo: title, result });
    onComplete?.(result);
  };

  return (
    <Card className="rounded-2xl shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg text-[#0F172A]">{title}</CardTitle>
        <p id={`demo-objective-${title.replace(/\s+/g, '-').toLowerCase()}`} className="text-sm text-slate-600">{objective}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-2">Steps:</h3>
          <ol className="list-decimal ml-5 text-sm text-slate-700 space-y-1">
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
        
        <div 
          role="region" 
          aria-label={`Interactive demo: ${title}`}
          className="border-t pt-4"
        >
          {children}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button
          onClick={handleStart}
          className="rounded-2xl bg-[#F76511] hover:bg-[#F76511]/90 focus:ring-2 focus:ring-[#F76511] tappable"
          aria-describedby={`demo-objective-${title.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {t('demo.start', 'Start')}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleComplete()}
          className="rounded-2xl focus:ring-2 focus:ring-[#F76511] tappable"
        >
          {t('demo.continue', 'Continue')}
        </Button>
      </CardFooter>
    </Card>
  );
}
