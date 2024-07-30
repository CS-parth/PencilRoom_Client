#!/bin/bash

# Specify the file to process
file="$1"

grep -v "console\.log" "$file" > "$file.tmp" && mv "$file.tmp" "$file"

echo "All console.log statements removed from $file"