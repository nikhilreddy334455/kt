import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Tag, ArrowRight, ImageOff, CheckCircle2 } from 'lucide-react';
import { Item } from '../lib/types';

interface ItemCardProps {
  item: Item;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const isLost = item.report_type === 'lost';
  const isResolved = item.status === 'resolved';

  const formattedDate = new Date(item.event_time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
      {/* Thumbnail Header */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        {!imageError && item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
            <ImageOff className="w-10 h-10 mb-2 stroke-1" />
            <span className="text-xs">No image preview</span>
          </div>
        )}

        {/* Report Type Badge (Lost vs Found) */}
        <div className="absolute top-3 left-3 flex gap-1.5 items-center">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
              isLost
                ? 'bg-rose-600 text-white shadow-rose-600/30'
                : 'bg-emerald-600 text-white shadow-emerald-600/30'
            }`}
          >
            {item.report_type}
          </span>

          {isResolved && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-sm shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Resolved
            </span>
          )}
        </div>

        {/* Category Tag overlay */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-slate-700 backdrop-blur-md shadow-sm border border-white/40">
            <Tag className="w-3 h-3 text-slate-500" />
            {item.category}
          </span>
        </div>
      </div>

      {/* Item Body Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {item.title}
          </h3>

          <p className="mt-1 text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          {/* Location */}
          <div className="flex items-center text-xs text-slate-500 gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{item.location}</span>
          </div>

          {/* Time */}
          <div className="flex items-center text-xs text-slate-500 gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          {/* Action Link */}
          <div className="pt-2">
            <Link
              to={`/item/${item.id}`}
              className="inline-flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-brand-600 bg-brand-50/70 hover:bg-brand-100 rounded-lg transition-colors group/btn"
            >
              <span>View Details &amp; AI Matches</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
