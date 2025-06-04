-- Update Game Asset URLs to use the new 'videos' bucket
-- This script is complementary to update_videos_storage_urls.sql

-- For the game components, we need to update the CDN URL constant
-- This should be done in the code files directly, but this SQL shows 
-- what the current system expects vs the new structure

-- Current game assets are expected at:
-- https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/bg.png
-- https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/chain.png

-- With your uploads, these should now be:
-- https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/bg.png
-- https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/chain.png

-- The game components that need updating in code are:
-- 1. components/games/module1/MiniCheckoff.tsx (uses bg.png)
-- 2. components/games/module2/MiniInspection.tsx (uses chain.png, bg2.png, and other assets)

-- Note: Since you've uploaded bg.png and chain.png to the 'videos' bucket,
-- we should update the game components to use this new path. 