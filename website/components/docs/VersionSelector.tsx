'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const versions = [
  { value: 'v0.2.2', label: 'v0.2.2 (Current)', default: true },
  { value: 'v1.0', label: 'v1.0 (Coming Soon)', disabled: true },
];

export function VersionSelector(): JSX.Element {
  const [selectedVersion, setSelectedVersion] = useState('v0.2.2');
  const router = useRouter();
  const pathname = usePathname();

  const handleVersionChange = (version: string): void => {
    setSelectedVersion(version);
    // In the future, this could navigate to version-specific docs
    // For now, we just update the UI
  };

  return (
    <div className="mb-4">
      <label htmlFor="version-select" className="block text-sm font-medium text-gray-700 mb-2">
        Version
      </label>
      <select
        id="version-select"
        value={selectedVersion}
        onChange={(e) => handleVersionChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        aria-label="Select OSSA version"
        aria-describedby="version-description"
      >
        {versions.map((version) => (
          <option
            key={version.value}
            value={version.value}
            disabled={version.disabled}
          >
            {version.label}
          </option>
        ))}
      </select>
    </div>
  );
}

