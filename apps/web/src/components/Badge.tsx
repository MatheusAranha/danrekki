interface BadgeProps {
  variant?: 'orange' | 'green' | 'red' | 'gray' | 'blue';
  children: React.ReactNode;
}

const variantClasses = {
  orange: 'bg-orange-500/20 text-orange-400',
  green: 'bg-green-500/20 text-green-400',
  red: 'bg-red-500/20 text-red-400',
  gray: 'bg-gray-700 text-gray-400',
  blue: 'bg-blue-500/20 text-blue-400',
};

export function Badge({ variant = 'gray', children }: BadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
