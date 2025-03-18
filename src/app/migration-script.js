/**
 * Migration Script for ShadCN Components
 * 
 * This script helps install all the required dependencies and set up ShadCN components.
 * 
 * Run with: node src/app/migration-script.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// List of components and their corresponding packages
const componentDependencies = {
  'alert-dialog': '@radix-ui/react-alert-dialog',
  'dialog': '@radix-ui/react-dialog',
  'select': '@radix-ui/react-select',
  'checkbox': '@radix-ui/react-checkbox',
  'popover': '@radix-ui/react-popover',
  'slot': '@radix-ui/react-slot',
  'label': '@radix-ui/react-label',
  'tabs': '@radix-ui/react-tabs',
  'separator': '@radix-ui/react-separator',
  'toast': '@radix-ui/react-toast',
};

// Detect and install missing components
function installMissingPackages() {
  console.log('Checking for missing dependencies...');
  
  const packages = [];
  for (const [component, pkg] of Object.entries(componentDependencies)) {
    try {
      require.resolve(pkg);
      console.log(`✅ ${pkg} already installed`);
    } catch (e) {
      console.log(`⬜ ${pkg} missing - will install`);
      packages.push(pkg);
    }
  }
  
  if (packages.length > 0) {
    console.log(`Installing ${packages.length} packages...`);
    execSync(`npm install ${packages.join(' ')}`, { stdio: 'inherit' });
    console.log('Installation complete!');
  } else {
    console.log('All dependencies are already installed.');
  }
}

// Create textarea component if missing
function createTextareaComponent() {
  const textareaPath = path.join(__dirname, '..', 'components', 'ui', 'textarea.tsx');
  
  if (fs.existsSync(textareaPath)) {
    console.log('Textarea component already exists.');
    return;
  }
  
  const content = `import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }`;

  fs.writeFileSync(textareaPath, content);
  console.log('Created Textarea component.');
}

// Main function
function main() {
  console.log('🚀 Starting ShadCN component setup...');
  
  installMissingPackages();
  createTextareaComponent();
  
  console.log('✅ Setup complete!');
  console.log('Next steps:');
  console.log('1. Continue with the migration guide in src/app-router-migration-guide.md');
  console.log('2. Convert your remaining pages to use the App Router format');
  console.log('3. Update components to use next/navigation');
}

// Run the script
main(); 