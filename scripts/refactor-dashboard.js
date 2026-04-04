import fs from 'fs';
import path from 'path';

const dashboardPath = path.resolve('./src/pages/dashboard.astro');
let content = fs.readFileSync(dashboardPath, 'utf8');

// 1. Quick Action Containers
content = content.replace(
  /class="group relative overflow-hidden bg-surface-container rounded-2xl hover:bg-surface-container-highest transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-\[0_12px_32px_rgba\(31,41,55,0\.06\)\] dark:hover:shadow-\[0_20px_40px_rgba\(0,0,0,0\.4\)\]"/g,
  'class="group relative overflow-hidden bg-surface-container-lowest rounded-2xl hover:bg-surface-container-low transition-all duration-300 transform hover:-translate-y-1 shadow-premium hover:shadow-premium-hover backdrop-blur-sm"'
);

// 2. Icon Backgrounds in Quick Actions
content = content.replace(
  /bg-white dark:bg-gray-800 shadow-sm/g,
  'bg-surface-container-lowest border-none'
);

// 3. Analytics Quotas (Primary, Green, Purple, Orange)
content = content.replace(
  /bg-primary-50 dark:bg-primary-900\/10 rounded-2xl border border-primary-100 dark:border-primary-800\/50/g,
  'bg-primary-500/10 rounded-2xl border-none'
);
content = content.replace(
  /bg-green-50 dark:bg-green-900\/10 rounded-2xl border border-green-100 dark:border-green-800\/50/g,
  'bg-green-500/10 rounded-2xl border-none'
);
content = content.replace(
  /bg-purple-50 dark:bg-purple-900\/10 rounded-2xl border border-purple-100 dark:border-purple-800\/50/g,
  'bg-purple-500/10 rounded-2xl border-none'
);
content = content.replace(
  /bg-orange-50 dark:bg-orange-900\/10 rounded-2xl border border-orange-100 dark:border-orange-800\/50/g,
  'bg-orange-500/10 rounded-2xl border-none'
);

// 4. Analytics mini labels inside cards
content = content.replace(
  /bg-gray-50 dark:bg-gray-900\/40 border border-gray-100 dark:border-gray-800 transition-colors hover:bg-white dark:hover:bg-gray-800 shadow-sm/g,
  'bg-surface-container-lowest transition-colors hover:bg-surface-container-low border-none'
);

// 5. Charts container bars
content = content.replace(
  /bg-gray-100 dark:bg-gray-700\/50 rounded-full h-3 overflow-hidden border border-gray-100 dark:border-gray-700/g,
  'bg-surface-container-lowest rounded-full h-3 overflow-hidden border-none'
);

// 6. Recent Quotes Container
content = content.replace(
  /bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-\[0_8px_24px_rgba\(31,41,55,0\.04\)\] dark:hover:shadow-\[0_12px_24px_rgba\(0,0,0,0\.2\)\] transition-all px-4 sm:px-6/g,
  'bg-surface-container-lowest rounded-xl hover:shadow-premium-hover transition-all px-4 sm:px-6'
);

// 7. Recent Quotes Custom Backgrounds for Statuses
content = content.replace(
  /bg-green-100 text-green-600 dark:bg-green-900\/30 dark:text-green-400 border border-green-200 dark:border-green-800/g,
  'bg-green-500/10 text-green-400 border-none'
);
content = content.replace(
  /bg-blue-100 text-blue-600 dark:bg-blue-900\/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/g,
  'bg-blue-500/10 text-blue-400 border-none'
);
content = content.replace(
  /bg-red-100 text-red-600 dark:bg-red-900\/30 dark:text-red-400 border border-red-200 dark:border-red-800/g,
  'bg-red-500/10 text-red-400 border-none'
);
content = content.replace(
  /bg-amber-100 text-amber-600 dark:bg-amber-900\/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/g,
  'bg-amber-500/10 text-amber-400 border-none'
);
content = content.replace(
  /bg-gray-100 text-gray-600 dark:bg-gray-900\/30 dark:text-gray-400 border border-gray-200 dark:border-gray-800/g,
  'bg-gray-500/10 text-gray-400 border-none'
);

// 8. Empty state placeholder icon
content = content.replace(
  /bg-gray-50 dark:bg-gray-900\/40 flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4 border border-dashed border-gray-200 dark:border-gray-700/g,
  'bg-surface-container-lowest flex items-center justify-center text-gray-500 mb-4 border-none'
);

// Text simplifications from dark:text... to handle pure dark mode
content = content.replace(/text-gray-900 dark:text-white/g, 'text-white');
content = content.replace(/text-gray-500 dark:text-gray-400/g, 'text-gray-400');
content = content.replace(/text-gray-700 dark:text-gray-300/g, 'text-gray-300');

fs.writeFileSync(dashboardPath, content);
console.log('Dashboard refactored effectively.');
