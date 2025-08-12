import { Check, Info } from 'lucide-react';
import { useState } from 'react';
import type { RecommendedPart } from '@/types/recommendations';

interface MatchTypeBadgeProps {
  item: RecommendedPart;
  className?: string;
}

export default function MatchTypeBadge({ item, className = '' }: MatchTypeBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const isBestMatch = item.matchType === 'best';
  
  // Generate tooltip content based on the charger's specs and reasons
  const tooltipContent = isBestMatch 
    ? `Perfect match: ${item.reasons.slice(0, 2).map(r => r.label).join(', ')}`
    : `Close alternative: ${item.reasons.slice(0, 2).map(r => r.label).join(', ')}`;

  const badgeClasses = isBestMatch
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-orange-100 text-orange-800 border-orange-200';

  const Icon = isBestMatch ? Check : Info;
  const badgeText = isBestMatch ? 'Best Match' : 'Alternate Option';

  return (
    <div className={`relative ${className}`}>
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${badgeClasses} cursor-help`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        tabIndex={0}
        aria-label={`${badgeText}: ${tooltipContent}`}
        role="button"
      >
        <Icon className="h-3 w-3" />
        <span>{badgeText}</span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute z-20 mt-1 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg"
          role="tooltip"
        >
          <div className="relative">
            {tooltipContent}
            {item.score && (
              <div className="mt-1 text-gray-300">
                Match score: {item.score}
              </div>
            )}
            {/* Arrow */}
            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45 transform -translate-y-1"></div>
          </div>
        </div>
      )}
    </div>
  );
}
