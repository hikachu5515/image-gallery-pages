import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const imagesDir = path.join(rootDir, "images");
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");
const manifestPath = path.join(distDir, "manifest.json");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);
const checkMode = process.argv.includes("--check");

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listFolders() {
  if (!(await exists(imagesDir))) {
    throw new Error(`Missing images directory: ${imagesDir}`);
  }

  const entries = await readdir(imagesDir, { withFileTypes: true });
  const folders = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const folderPath = path.join(imagesDir, entry.name);
    const files = await readdir(folderPath, { withFileTypes: true });
    const images = files
      .filter((file) => file.isFile() && supportedExtensions.has(path.extname(file.name).toLowerCase()))
      .map((file) => ({
        fileName: file.name,
        name: path.parse(file.name).name,
        path: `./images/${encodeURIComponent(entry.name)}/${encodeURIComponent(file.name)}`,
      }))
      .sort((a, b) => a.fileName.localeCompare(b.fileName));

    folders.push({
      name: entry.name,
      path: `./?folder=${encodeURIComponent(entry.name)}`,
      imageCount: images.length,
      images,
    });
  }

  return folders.sort((a, b) => a.name.localeCompare(b.name));
}

async function copyDirectory(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const from = path.join(sourceDir, entry.name);
    const to = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(from, to);
      continue;
    }

    await copyFile(from, to);
  }
}

async function buildManifest() {
  const folders = await listFolders();
  return {
    generatedAt: new Date().toISOString(),
    folders,
  };
}

async function writeDist(manifest) {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await copyDirectory(srcDir, distDir);
  await copyDirectory(imagesDir, path.join(distDir, "images"));
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function runCheck(manifest) {
  const currentText = await readFile(manifestPath, "utf8").catch(() => "");
  if (!currentText) {
    throw new Error("manifest.json is out of date. Run npm run generate.");
  }

  const current = JSON.parse(currentText);
  const expectedFolders = JSON.stringify(manifest.folders);
  const currentFolders = JSON.stringify(current.folders ?? []);

  if (currentFolders !== expectedFolders) {
    throw new Error("manifest.json is out of date. Run npm run generate.");
  }
}

async function main() {
  const manifest = await buildManifest();

  if (checkMode) {
    await runCheck(manifest);
    console.log("manifest.json is up to date.");
    return;
  }

  await writeDist(manifest);
  console.log(`Generated site in ${distDir}`);
  console.log(`Folders: ${manifest.folders.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
