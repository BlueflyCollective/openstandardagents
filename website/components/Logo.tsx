'use client';

interface LogoProps {
  domain: string;
  name: string;
}

// Special handling for domains that don't work with clearbit
// Use SimpleIcons or direct logo URLs where available
const LOGO_FALLBACKS: Record<string, string> = {
  'kagent.dev': 'https://simpleicons.org/icons/kubernetes.svg',
  'langchain.com': 'https://simpleicons.org/icons/langchain.svg',
  'crewai.com': 'https://www.crewai.com/favicon.ico', // Use favicon as fallback
  'llamaindex.ai': 'https://www.llamaindex.ai/favicon.ico', // LlamaIndex favicon
  'modelcontextprotocol.io': 'https://simpleicons.org/icons/anthropic.svg', // MCP - using Anthropic
  'librechat.com': 'https://simpleicons.org/icons/react.svg', // LibreChat placeholder
  'langflow.com': 'https://simpleicons.org/icons/python.svg', // Langflow placeholder
};

export function Logo({ domain, name }: LogoProps) {
  const getLogoSrc = () => {
    // Check for name-based fallbacks first (for cases where domain is shared)
    if (name === 'LangGraph' && domain === 'langchain.com') {
      return 'https://simpleicons.org/icons/langchain.svg'; // LangGraph is part of LangChain
    }
    if (name === 'LlamaIndex') {
      return 'https://www.llamaindex.ai/favicon.ico';
    }
    // Check domain-based fallbacks
    if (LOGO_FALLBACKS[domain]) {
      return LOGO_FALLBACKS[domain];
    }
    return `https://logo.clearbit.com/${domain}`;
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Try Google favicon service as fallback
    const fallbackSrc = `https://www.google.com/s2/favicons?sz=256&domain=${domain}`;
    if (e.currentTarget.src !== fallbackSrc) {
      e.currentTarget.src = fallbackSrc;
    } else {
      // If both fail, use a placeholder
      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0U1RTdFQiIvPgo8cGF0aCBkPSJNMTIgOEMxMy4xIDggMTQgOC45IDE0IDEwQzE0IDExLjEgMTMuMSAxMiAxMiAxMkMxMC45IDEyIDEwIDExLjEgMTAgMTBDMTAgOC45IDEwLjkgOCAxMiA4Wk0xMiAxNEMxMy4xIDE0IDE0IDE0LjkgMTQgMTZDMTQgMTcuMSAxMy4xIDE4IDEyIDE4QzEwLjkgMTggMTAgMTcuMSAxMCAxNkMxMCAxNC45IDEwLjkgMTQgMTIgMTRaIiBmaWxsPSIjOUI5Q0E0Ii8+Cjwvc3ZnPgo=';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 hover:bg-white rounded-lg transition-all">
      <img
        src={getLogoSrc()}
        alt={name}
        className="h-12 w-12 object-contain"
        onError={handleError}
      />
      <span className="text-sm font-medium text-gray-600">{name}</span>
    </div>
  );
}
