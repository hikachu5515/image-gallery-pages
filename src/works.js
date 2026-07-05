const worksList = document.getElementById("works-list");
const worksEmpty = document.getElementById("works-empty");
const worksMeta = document.getElementById("works-meta");
const worksMetaTitle = document.getElementById("works-meta-title");
const projectTemplate = document.getElementById("project-template");
const phaseTemplate = document.getElementById("phase-template");
const photoTemplate = document.getElementById("photo-template");

function setEmpty(message) {
  worksEmpty.hidden = false;
  worksEmpty.textContent = message;
  worksList.replaceChildren();
}

function clearEmpty() {
  worksEmpty.hidden = true;
  worksEmpty.textContent = "";
}

function renderProjects(projects) {
  clearEmpty();

  if (projects.length === 0) {
    worksMetaTitle.textContent = "施工事例がありません";
    worksMeta.textContent = "";
    setEmpty("images/<案件>/before と images/<案件>/after に画像を追加してください。");
    return;
  }

  const totalImages = projects.reduce((count, project) => {
    return count + project.phases.reduce((phaseCount, phase) => phaseCount + phase.images.length, 0);
  }, 0);

  worksMetaTitle.textContent = "施工事例一覧";
  worksMeta.textContent = `${projects.length} 件 / ${totalImages} 枚`;

  const projectFragment = document.createDocumentFragment();

  for (const project of projects) {
    const projectNode = projectTemplate.content.firstElementChild.cloneNode(true);
    const projectLabel = projectNode.querySelector(".project-label");
    const projectTitle = projectNode.querySelector(".project-title");
    const projectSummary = projectNode.querySelector(".project-summary");
    const projectMeta = projectNode.querySelector(".project-meta");
    const phaseGrid = projectNode.querySelector(".phase-grid");

    projectLabel.textContent = project.code;
    projectTitle.textContent = project.title;
    projectSummary.textContent = project.summary;
    projectMeta.innerHTML = `
      <p>${project.location}</p>
      <p>${project.tags.join(" / ")}</p>
    `;

    const phaseFragment = document.createDocumentFragment();

    for (const phase of project.phases) {
      const phaseNode = phaseTemplate.content.firstElementChild.cloneNode(true);
      phaseNode.querySelector(".phase-label").textContent = phase.key;
      phaseNode.querySelector(".phase-title").textContent = phase.label;
      const phaseImages = phaseNode.querySelector(".phase-images");

      const photoFragment = document.createDocumentFragment();

      for (const image of phase.images) {
        const photoNode = photoTemplate.content.firstElementChild.cloneNode(true);
        const link = photoNode.querySelector(".photo-link");
        const img = photoNode.querySelector(".photo-image");
        const name = photoNode.querySelector(".photo-name");
        const file = photoNode.querySelector(".image-file");

        link.href = image.path;
        img.src = image.path;
        img.alt = `${project.title} ${phase.label} ${image.name}`;
        name.textContent = image.name;
        file.textContent = image.fileName;
        photoFragment.appendChild(photoNode);
      }

      phaseImages.replaceChildren(photoFragment);
      phaseFragment.appendChild(phaseNode);
    }

    phaseGrid.replaceChildren(phaseFragment);
    projectFragment.appendChild(projectNode);
  }

  worksList.replaceChildren(projectFragment);
}

async function main() {
  try {
    const response = await fetch("./manifest.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`manifest.json の読み込みに失敗しました: ${response.status}`);
    }

    const manifest = await response.json();
    renderProjects(manifest.projects ?? []);
  } catch (error) {
    worksMetaTitle.textContent = "読み込みエラー";
    worksMeta.textContent = "";
    setEmpty(error instanceof Error ? error.message : "不明なエラーです。");
  }
}

main();
