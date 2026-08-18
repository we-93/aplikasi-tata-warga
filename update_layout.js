const fs = require('fs');

const path = 'src/components/rt/rt-layout-shell.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Change main container to flex-col
content = content.replace(
  '<div className="flex h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 overflow-hidden">',
  '<div className="flex flex-col h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 overflow-hidden">'
);

// 2. Extract header
const headerStart = content.indexOf('        {/* Header */}');
const headerEnd = content.indexOf('        {/* Page Content */}');
const headerContent = content.substring(headerStart, headerEnd);

// 3. Remove header from its original place
content = content.substring(0, headerStart) + content.substring(headerEnd);

// 4. Remove Logo from Sidebar
const sidebarLogoStart = content.indexOf('        {/* Desktop Logo in Sidebar */}');
const sidebarLogoEnd = content.indexOf('        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">');
content = content.substring(0, sidebarLogoStart) + content.substring(sidebarLogoEnd);

// 5. Insert header at the top of the container
const containerStart = content.indexOf('<div className="flex flex-col h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 overflow-hidden">') + '<div className="flex flex-col h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 overflow-hidden">'.length;

// And wrap the sidebar and main in a flex container
content = content.substring(0, containerStart) + 
  '\n' + headerContent + 
  '\n      <div className="flex flex-1 overflow-hidden relative">\n' +
  content.substring(containerStart);

// We need to close the new wrapper at the end before mobile nav
const mobileNavStart = content.indexOf('      {/* MOBILE BOTTOM NAVIGATION */}');
content = content.substring(0, mobileNavStart) + '      </div>\n\n' + content.substring(mobileNavStart);

fs.writeFileSync(path, content, 'utf8');
console.log('Done');
