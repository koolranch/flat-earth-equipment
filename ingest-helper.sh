#!/bin/bash

# Create json directory if it doesn't exist
mkdir -p ingest/json

# Process each screenshot
for file in ingest/screenshots/*; do
    if [ -f "$file" ]; then
        echo "📸 Processing: $(basename "$file")"
        
        # auto-generate slug by stripping any "FireShot Capture ### - " prefix and everything after last dash,
        # then kebab-casing
        default_slug=$(basename "$file" | sed -E 's/^(FireShot Capture[[:space:]]*[0-9]+[[:space:]]*-[[:space:]]*)//i' \
                                    | sed -E 's/\.[a-zA-Z]+$//' \
                                    | sed -E 's/[^a-zA-Z0-9]+/-/g' \
                                    | sed -E 's/^-+|-+$//g' \
                                    | tr '[:upper:]' '[:lower:]')
        echo "Auto-generated slug: $default_slug"
        slug="$default_slug"
        
        echo "Paste the JSON from ChatGPT Vision (press Ctrl+D when done):"
        json_content=$(cat)
        
        # Save the JSON to a file
        echo "$json_content" > "ingest/json/${slug}.json"
        echo "✅ Saved to ingest/json/${slug}.json"
        echo "---"
    fi
done

echo "🎉 All screenshots processed!" 