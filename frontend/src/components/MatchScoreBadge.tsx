import React from 'react';
import { Sparkles, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  // Score tier styles (Section 17: Red/Yellow/Green)
  let badgeClasses = '';
  let textLabel = '';
  let IconComponent = HelpCircle;

  if (score >= 80) {
    // High confidence - Green
    badgeClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
    textLabel = 'High Match';
    IconComponent = CheckCircle;
  } else if (score >= 50) {
    // Moderate confidence - Amber/Yellow
    badgeClasses = 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
    textLabel = 'Possible Match';
    IconComponent = Sparkles;
  } else {
    // Low confidence - Red/Rose
    badgeClasses = 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
    textLabel = 'Low Match';
    IconComponent = AlertTriangle;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium gap-1',
    md: 'px-2.5 py-1 text-sm font-semibold gap-1.5',
    lg: 'px-3.5 py-1.5 text-base font-bold gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ring-1 ring-inset ${badgeClasses} ${sizeClasses}`}
      title={`AI Match Confidence: ${score}%`}
    >
      <IconComponent className={iconSizes} />
      <span>{score}%</span>
      {showLabel && <span className="opacity-80 font-normal">({textLabel})</span>}
    </span>
  );
};
