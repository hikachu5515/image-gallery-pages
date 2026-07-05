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
const phaseOrder = ["before", "after"];
const phaseLabels = {
  before: "Before",
  after: "After",
};
const projectMetadata = {
  "case-01": {
    code: "Case 01",
    title: "中古マンション LDK 改修",
    location: "東京都中野区",
    summary: "壁面収納と照明計画を見直し、家族が集まりやすいリビングへ更新した想定事例です。",
    tags: ["マンション", "LDK", "内装更新"],
  },
  "case-02": {
    code: "Case 02",
    title: "戸建てキッチン再構成",
    location: "神奈川県横浜市",
    summary: "キッチンの配置と収納量を見直し、作業性と片付けやすさを両立させた想定事例です。",
    tags: ["戸建て", "キッチン", "収納改善"],
  },
};

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

function toDisplayName(slug) {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function listProjects() {
  if (!(await exists(imagesDir))) {
    throw new Error(`Missing images directory: ${imagesDir}`);
  }

  const entries = await readdir(imagesDir, { withFileTypes: true });
  const projects = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const projectPath = path.join(imagesDir, entry.name);
    const childEntries = await readdir(projectPath, { withFileTypes: true });
    const availablePhases = childEntries
      .filter((child) => child.isDirectory() && phaseOrder.includes(child.name))
      .sort((a, b) => phaseOrder.indexOf(a.name) - phaseOrder.indexOf(b.name));

    if (availablePhases.length === 0) {
      continue;
    }

    const phases = [];

    for (const phaseEntry of availablePhases) {
      const phasePath = path.join(projectPath, phaseEntry.name);
      const files = await readdir(phasePath, { withFileTypes: true });
      const images = files
        .filter((file) => file.isFile() && supportedExtensions.has(path.extname(file.name).toLowerCase()))
        .map((file) => ({
          fileName: file.name,
          name: path.parse(file.name).name,
          path: `./images/${encodeURIComponent(entry.name)}/${encodeURIComponent(phaseEntry.name)}/${encodeURIComponent(file.name)}`,
        }))
        .sort((a, b) => a.fileName.localeCompare(b.fileName));

      phases.push({
        key: phaseEntry.name,
        label: phaseLabels[phaseEntry.name] ?? phaseEntry.name,
        images,
      });
    }

    const imageCount = phases.reduce((count, phase) => count + phase.images.length, 0);
    const metadata = projectMetadata[entry.name] ?? {};

    projects.push({
      slug: entry.name,
      code: metadata.code ?? toDisplayName(entry.name),
      title: metadata.title ?? toDisplayName(entry.name),
      location: metadata.location ?? "東京都内",
      summary: metadata.summary ?? "住まいの改善内容を before / after で比較できる施工事例です。",
      tags: metadata.tags ?? ["リフォーム"],
      imageCount,
      phases,
    });
  }

  return projects.sort((a, b) => a.slug.localeCompare(b.slug));
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
  const projects = await listProjects();
  const imageCount = projects.reduce((count, project) => count + project.imageCount, 0);
  return {
    generatedAt: new Date().toISOString(),
    stats: {
      projectCount: projects.length,
      imageCount,
    },
    projects,
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
  const expectedProjects = JSON.stringify(manifest.projects);
  const currentProjects = JSON.stringify(current.projects ?? []);

  if (currentProjects !== expectedProjects) {
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
  console.log(`Projects: ${manifest.projects.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
