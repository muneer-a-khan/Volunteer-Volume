#!/bin/bash

# This script removes the Layout component wrapper from React components
# while preserving the content inside

FILES=$(find src/app -type f -name "*.tsx" -exec grep -l "import Layout from" {} \;)

for file in $FILES; do
  echo "Processing $file..."
  
  # Remove the Layout import line
  sed -i '' '/import Layout from/d' "$file"
  
  # Replace Layout wrapper with its content
  sed -i '' 's/<Layout>[ ]*//g' "$file"
  sed -i '' 's/[ ]*<\/Layout>//g' "$file"
  
  echo "Processed $file"
done

echo "Done! Removed Layout component from all pages." 