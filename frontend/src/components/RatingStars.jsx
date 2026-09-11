import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, reviewCount, showCount = true, size = 15 }) => {
  const roundedRating = Math.round(rating * 10) / 10;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(rating);
          return (
            <Star
              key={star}
              size={size}
              fill={isFilled ? '#f59e0b' : 'transparent'}
              color={isFilled ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)'}
            />
          );
        })}
      </div>
      {showCount && (
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {roundedRating > 0 ? roundedRating : 'New'}
          {reviewCount !== undefined && reviewCount > 0 && ` (${reviewCount})`}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
