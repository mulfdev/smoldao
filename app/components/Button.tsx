
import { twMerge } from 'tailwind-merge';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
}) {
  const baseClasses = "w-fit shrink-0 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-400 hover:bg-blue-500 text-gray-900 disabled:hover:bg-blue-400",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-100 disabled:hover:bg-gray-700 border border-gray-600"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={twMerge(baseClasses, variants[variant], className)}
    >
      {children}
    </button>
  );
}

