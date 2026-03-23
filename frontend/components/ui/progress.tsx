import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-[var(--surface-container-low)]', className)}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-gradient-to-r from-[var(--primary)] to-[var(--surface-tint)] transition-all"
        style={{ transform: `translateX(-${100 - Math.min(value, 100)}%)` }}
      />
    </div>
  ),
);
Progress.displayName = 'Progress';

export { Progress };
