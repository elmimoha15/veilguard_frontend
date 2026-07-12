import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'ink' | 'yellow' | 'ghost';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  ink: 'bg-ink text-white',
  yellow: 'bg-yellow text-ink font-bold',
  ghost: 'bg-transparent text-ink hover:text-yellow-dark hover:scale-100',
};

const sizes = {
  sm: 'text-[13.5px] px-4 h-10',
  md: 'text-[15px] px-5 h-12',
  lg: 'text-[16px] px-6 h-14',
} as const;

interface CommonProps {
  variant?: Variant;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
}

export default function Button({
  variant = 'ink',
  size = 'md',
  className,
  children,
  href,
  ...rest
}: CommonProps &
  ({ href: string } & React.ComponentProps<typeof Link>) ) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  );
}

export function ButtonEl({
  variant = 'ink',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}
