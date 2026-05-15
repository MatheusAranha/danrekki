import { Link } from 'react-router-dom';
import { Button } from './Button';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  backLink?: { label: string; to: string };
}

export function PageHeader({ title, description, action, backLink }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex flex-col gap-1">
        {backLink && (
          <Link
            to={backLink.to}
            className="text-sm text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-1 mb-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {backLink.label}
          </Link>
        )}
        <h1 className="text-2xl font-bold text-gray-100">{title}</h1>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
}
