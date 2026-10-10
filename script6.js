const fs = require('fs');
let code = fs.readFileSync('src/app/(marketing)/profile/ProfileClient.tsx', 'utf8');

code = code.replace(
  /<button[\s\n]*onClick=\{\(\) => router.push\('\/pricing'\)\}[\s\n]*className="w-full h-\[48px\] bg-\[#1F2123\] rounded-\[40px\] font-sans font-medium text-\[16px\] text-white mb-\[32px\] hover:bg-black transition-colors"[\s\n]*>[\s\n]*Upgrade to Premium[\s\n]*<\/button>/g,
  '{/* Upgrade button temporarily disabled */}'
);

fs.writeFileSync('src/app/(marketing)/profile/ProfileClient.tsx', code);
console.log('ProfileClient updated');

