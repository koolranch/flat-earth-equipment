#!/bin/bash

# Create json directory if it doesn't exist
mkdir -p ingest/json

# Process each screenshot
for file in ingest/screenshots/*; do
    if [ -f "$file" ]; then
        echo "📸 Processing: $(basename "$file")"
        
        # Derive a default slug from the screenshot filename
        filename=$(basename "$file" | sed -E 's/\.[^.]+$//')
        # Remove any leading numbers/titles, downcase, turn non-alphanumerics into hyphens
        default_slug=$(echo "$filename" \
                      | sed -E 's/^[0-9]+[[:space:]-]*//' \
                      | tr '[:upper:]' '[:lower:]' \
                      | sed -E 's/[^a-z0-9]+/-/g' \
                      | sed -E 's/^-+|-+$//g')
        # Prompt, falling back to the derived slug
        echo "Enter product slug [${default_slug}]:"
        read -r slug
        slug=${slug:-$default_slug}
        
        echo "Paste the JSON from ChatGPT Vision (press Ctrl+D when done):"
        json_content=$(cat)
        
        # Save the JSON to a file
        echo "$json_content" > "ingest/json/${slug}.json"
        echo "✅ Saved to ingest/json/${slug}.json"
        echo "---"
    fi
done

echo "🎉 All screenshots processed!" 