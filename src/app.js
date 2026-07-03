const folderList = document.getElementById("folder-list");
const galleryGrid = document.getElementById("gallery-grid");
const viewTitle = document.getElementById("view-title");
const viewMeta = document.getElementById("view-meta");
const emptyState = document.getElementById("empty-state");
const folderCardTemplate = document.getElementById("folder-card-template");
const imageCardTemplate = document.getElementById("image-card-template");
const folderCount = document.getElementById("folder-count");
const imageCount = document.getElementById("image-count");

const params = new URLSearchParams(window.location.search);
const selectedFolder = params.get("folder");

function setEmpty(message) {
  emptyState.hidden = false;
  emptyState.textContent = message;
  galleryGrid.replaceChildren();
}

function clearEmpty() {
  emptyState.hidden = true;
  emptyState.textContent = "";
}

function renderSummary(folders) {
  const totalImages = folders.reduce((count, folder) => count + folder.images.length, 0);
  folderCount.textContent = String(folders.length);
  imageCount.textContent = String(totalImages);
}

function renderFolders(folders, currentFolder) {
  const fragment = document.createDocumentFragment();

  for (const folder of folders) {
    const node = folderCardTemplate.content.firstElementChild.cloneNode(true);
    node.href = `./?folder=${encodeURIComponent(folder.name)}`;
    node.textContent = folder.name;
    node.dataset.active = String(folder.name === currentFolder);
    fragment.appendChild(node);
  }

  folderList.replaceChildren(fragment);
}

function renderOverview(folders) {
  clearEmpty();
  viewTitle.textContent = "すべてのフォルダ";
  viewMeta.textContent = `${folders.length} フォルダ`;

  const fragment = document.createDocumentFragment();
  for (const folder of folders) {
    const node = folderCardTemplate.content.firstElementChild.cloneNode(true);
    node.href = `./?folder=${encodeURIComponent(folder.name)}`;
    node.innerHTML = `<strong>${folder.name}</strong><span>${folder.images.length} 枚</span>`;
    fragment.appendChild(node);
  }
  galleryGrid.replaceChildren(fragment);
}

function renderFolder(folder) {
  clearEmpty();
  viewTitle.textContent = folder.name;
  viewMeta.textContent = `${folder.images.length} 枚`;

  if (folder.images.length === 0) {
    setEmpty("このフォルダには画像がありません。");
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const image of folder.images) {
    const node = imageCardTemplate.content.firstElementChild.cloneNode(true);
    const link = node.querySelector(".image-link");
    const img = node.querySelector(".image-thumb");
    const name = node.querySelector(".image-name");
    const file = node.querySelector(".image-file");

    link.href = image.path;
    img.src = image.path;
    img.alt = image.name;
    name.textContent = image.name;
    file.textContent = image.fileName;
    fragment.appendChild(node);
  }

  galleryGrid.replaceChildren(fragment);
}

async function main() {
  try {
    const response = await fetch("./manifest.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.status}`);
    }

    const manifest = await response.json();
    const folders = manifest.folders ?? [];
    renderSummary(folders);
    renderFolders(folders, selectedFolder);

    if (folders.length === 0) {
      setEmpty("フォルダが見つかりません。images/<folder-name>/ に画像を追加して再生成してください。");
      viewTitle.textContent = "フォルダがありません";
      viewMeta.textContent = "";
      return;
    }

    if (!selectedFolder) {
      renderOverview(folders);
      return;
    }

    const folder = folders.find((entry) => entry.name === selectedFolder);
    if (!folder) {
      viewTitle.textContent = "フォルダが見つかりません";
      viewMeta.textContent = "";
      setEmpty(`manifest.json にフォルダ「${selectedFolder}」が見つかりませんでした。`);
      return;
    }

    renderFolder(folder);
  } catch (error) {
    viewTitle.textContent = "読み込みエラー";
    viewMeta.textContent = "";
    setEmpty(error instanceof Error ? error.message : "不明なエラーです。");
  }
}

main();
