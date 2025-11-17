'use client';

interface LogoProps {
  domain: string;
  name: string;
}

export function Logo({ domain, name }: LogoProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://www.google.com/s2/favicons?sz=256&domain=${domain}`;
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 hover:bg-white rounded-lg transition-all">
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={name}
        className="h-12 w-12 object-contain"
        onError={handleError}
      />
      <span className="text-sm font-medium text-gray-600">{name}</span>
    </div>
  );
}
