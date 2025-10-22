import { chromium } from "@playwright/test";
import { mkdirSync, copyFileSync } from "node:fs";
import ffmpeg from "ffmpeg-static";
import { execa } from "execa";

const ORIGIN = process.env.DEMO_ORIGIN ?? "http://localhost:3000";
const DEMO_URL = `${ORIGIN}/training/module-1?demo=1`;

async function run() {
  mkdirSync("public/media/demo", { recursive: true });
  mkdirSync("tmp/video", { recursive: true });

  console.log("🎬 Starting browser capture...");
  console.log(`📍 Target: ${DEMO_URL}`);

  // Launch with video recording
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: "tmp/video", size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  // Go to demo route and add a subtle DEMO watermark
  console.log("🌐 Loading training module...");
  await page.goto(DEMO_URL, { waitUntil: "networkidle", timeout: 60000 });
  
  await page.addStyleTag({ 
    content: `
      .__demo_watermark__ {
        position: fixed; inset: auto 8px 8px auto;
        font: 700 12px/1.2 Inter, system-ui, sans-serif;
        color: #F76511; background: rgba(255,247,237,.9);
        border: 1px solid #E2E8F0; border-radius: 6px; padding: 4px 8px; z-index: 99999;
        pointer-events: none;
      }
    `
  });
  
  await page.evaluate(() => {
    const el = document.createElement("div");
    el.className = "__demo_watermark__";
    el.textContent = "DEMO";
    document.body.appendChild(el);
  });

  console.log("🎭 Performing interactions...");

  try {
    await page.waitForTimeout(1500); // brief settle

    // Try to navigate to Video tab if it exists
    const videoTab = page.getByRole("tab", { name: /Video|Watch/i });
    if (await videoTab.count() > 0) {
      console.log("  📹 Clicking Video tab...");
      await videoTab.first().click();
      await page.waitForTimeout(2000);
    }

    // Try Flash Cards tab
    const flashTab = page.getByRole("tab", { name: /Flash Cards/i });
    if (await flashTab.count() > 0) {
      console.log("  🎴 Clicking Flash Cards tab...");
      await flashTab.first().click();
      await page.waitForTimeout(1500);

      // Reveal answer
      const revealBtn = page.getByRole("button", { name: /Reveal Answer/i });
      if (await revealBtn.count() > 0) {
        console.log("  👁️  Revealing answer...");
        await revealBtn.first().click();
        await page.waitForTimeout(1500);
      }

      // Click Next
      const nextBtn = page.getByRole("button", { name: /Next/i });
      if (await nextBtn.count() > 0) {
        console.log("  ⏭️  Clicking Next...");
        await nextBtn.first().click();
        await page.waitForTimeout(1500);
      }
    }

    // Try Practice tab
    const practiceTab = page.getByRole("tab", { name: /Practice|Check/i });
    if (await practiceTab.count() > 0) {
      console.log("  ✅ Clicking Practice tab...");
      await practiceTab.first().click();
      await page.waitForTimeout(2000);
    }

    // Smooth scroll to show UI
    console.log("  📜 Scrolling page...");
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(800);
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log("  ⚠️  Some interactions failed (non-fatal):", (error as Error).message);
  }

  // Take poster screenshot
  console.log("📸 Capturing poster screenshot...");
  await page.screenshot({
    path: "public/media/demo/poster.jpg",
    type: "jpeg",
    quality: 70, // keep <150 KB
  });

  // Let video run for total ~20s
  console.log("⏱️  Recording for 20 seconds total...");
  const elapsed = Date.now() - (Date.now() - 20000);
  const remaining = Math.max(0, 20000 - elapsed);
  await page.waitForTimeout(remaining);

  console.log("🎬 Finalizing video...");
  const video = await page.video();
  const rawPath = await video!.path();
  await context.close(); // finalizes video file
  await browser.close();

  console.log(`📼 Raw video: ${rawPath}`);

  // Compress with FFmpeg
  const webmOut = "public/media/demo/hero-demo.webm";
  const mp4Out = "public/media/demo/hero-demo.mp4";

  if (ffmpeg) {
    console.log("🎞️  Encoding WebM (VP9)...");
    await execa(ffmpeg, [
      "-y", "-i", rawPath,
      "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34",
      "-vf", "scale=1280:720:force_original_aspect_ratio=decrease",
      "-an", webmOut
    ]);

    console.log("🎞️  Encoding MP4 (H.264)...");
    await execa(ffmpeg, [
      "-y", "-i", rawPath,
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
      "-vf", "scale=1280:720:force_original_aspect_ratio=decrease",
      "-an", mp4Out
    ]);
  } else {
    console.log("⚠️  FFmpeg not found, copying raw file...");
    copyFileSync(rawPath, webmOut);
  }

  console.log("\n✅ Demo capture complete!");
  console.log("📁 Outputs:");
  console.log("   - public/media/demo/poster.jpg");
  console.log("   - public/media/demo/hero-demo.webm");
  console.log("   - public/media/demo/hero-demo.mp4");
}

run().catch((e) => {
  console.error("❌ Capture failed:", e);
  process.exit(1);
});

