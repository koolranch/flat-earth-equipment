import { existsSync, statSync } from "node:fs";

const required = [
  { path: "public/media/demo/poster.jpg", minSize: 10 * 1024 }, // min 10 KB
  { path: "public/media/demo/hero-demo.webm", minSize: 100 * 1024 }, // min 100 KB
  { path: "public/media/demo/hero-demo.mp4", minSize: 100 * 1024 }, // min 100 KB
];

const issues: string[] = [];

required.forEach(({ path, minSize }) => {
  if (!existsSync(path)) {
    issues.push(`${path} (missing)`);
  } else {
    const size = statSync(path).size;
    if (size < minSize) {
      issues.push(`${path} (${size} bytes, need ≥${minSize})`);
    }
  }
});

if (issues.length > 0) {
  console.error("\n❌ [demo-media] Issues with required files:");
  issues.forEach((issue) => console.error(`   - ${issue}`));
  console.error("\n💡 Run: npm run demo:capture  (or add your media manually)\n");
  process.exit(1);
}

console.log("✅ [demo-media] All required media files present and valid");

