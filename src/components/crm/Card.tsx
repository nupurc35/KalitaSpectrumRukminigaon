import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string; // Explicitly adding this to satisfy some linters
}

export const Card = ({ children, className, ...props }: CardProps) => {
    return (
        <div
            className={cn(
                'bg-[#171717] border border-white/10 rounded-[12px] shadow-sm overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className, ...props }: CardProps) => (
    <div className={cn('p-6 pb-3', className)} {...props}>{children}</div>
);

export const CardContent = ({ children, className, ...props }: CardProps) => (
    <div className={cn('p-6 pt-0', className)} {...props}>{children}</div>
);

export const CardFooter = ({ children, className, ...props }: CardProps) => (
    <div className={cn('p-6 pt-0', className)} {...props}>{children}</div>
);
