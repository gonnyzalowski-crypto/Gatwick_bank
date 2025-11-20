import React from 'react';

/**
 * Gatwick Bank Professional Logo
 * Modern, clean design suitable for fintech
 */
export const Logo = ({ size = 'md', variant = 'full' }) => {
  const sizes = {
    sm: { container: 'h-8', text: 'text-lg', icon: 'w-6 h-6' },
    md: { container: 'h-10', text: 'text-xl', icon: 'w-8 h-8' },
    lg: { container: 'h-12', text: 'text-2xl', icon: 'w-10 h-10' },
  };

  const s = sizes[size];

  // Icon only variant
  if (variant === 'icon') {
    return (
      <div className={`${s.icon} flex items-center justify-center`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Modern geometric bank icon */}
          <rect x="4" y="16" width="32" height="20" rx="2" fill="url(#logo-gradient1-icon)" />
          <path d="M20 4L36 14H4L20 4Z" fill="url(#logo-gradient2-icon)" />
          <rect x="10" y="20" width="4" height="10" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="18" y="20" width="4" height="10" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="26" y="20" width="4" height="10" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="4" y="32" width="32" height="2" rx="1" fill="#312E81" />
          
          <defs>
            <linearGradient id="logo-gradient1-icon" x1="20" y1="16" x2="20" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="logo-gradient2-icon" x1="20" y1="4" x2="20" y2="14" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Full logo with text
  return (
    <div className={`flex items-center gap-3 ${s.container}`}>
      {/* Icon */}
      <div className={s.icon}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="16" width="32" height="20" rx="2" fill="url(#logo-gradient1-full)" />
          <path d="M20 4L36 14H4L20 4Z" fill="url(#logo-gradient2-full)" />
          <rect x="10" y="20" width="4" height="10" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="18" y="20" width="4" height="10" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="26" y="20" width="4" height="10" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="4" y="32" width="32" height="2" rx="1" fill="#312E81" />
          
          <defs>
            <linearGradient id="logo-gradient1-full" x1="20" y1="16" x2="20" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="logo-gradient2-full" x1="20" y1="4" x2="20" y2="14" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span className={`${s.text} font-bold text-neutral-900 tracking-tight`}>
          Gatwick
        </span>
        <span className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">
          Bank
        </span>
      </div>
    </div>
  );
};

export default Logo;
