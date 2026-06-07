import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6 ${className}`}
      {...props}
    >
      {title && (
        <h2 className="mb-4 border-b border-stroke pb-3 text-xl font-bold text-black dark:border-strokedark dark:text-white">
          {title}
        </h2>
      )}

      {children}
    </div>
  );
}

export default Card;
