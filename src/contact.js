const contactLead = document.getElementById("contact-lead");
const contactNote = document.getElementById("contact-note");
const googleFormLink = document.getElementById("google-form-link");
const microsoftFormLink = document.getElementById("microsoft-form-link");
const contactDirect = document.getElementById("contact-direct");
const recommendedPlatformTitle = document.getElementById("recommended-platform-title");
const recommendedPlatformBody = document.getElementById("recommended-platform-body");

const platformText = {
  google: {
    title: "Google Forms を軸にする構成",
    body: "Google Form と Google スプレッドシートは連携が素直で、Apps Script で通知メールや担当者振り分けも追加しやすい構成です。",
  },
  microsoft: {
    title: "Microsoft Forms を軸にする構成",
    body: "Microsoft Forms と Excel / Power Automate を組み合わせると、Microsoft 365 を使う環境では通知や承認フローまで一気通貫で整えやすいです。",
  },
};

async function main() {
  try {
    const response = await fetch("./site-data.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`site-data.json の読み込みに失敗しました: ${response.status}`);
    }

    const data = await response.json();
    const company = data.company ?? {};
    const contact = data.contact ?? {};
    const preferred = platformText[contact.preferredPlatform] ?? platformText.google;

    contactLead.textContent =
      "実運用では、発行済みの Google Form または Microsoft Forms の URL を設定ファイルで差し替えて利用します。";
    contactNote.textContent =
      contact.notes ?? "実際の公開時は、作成したフォームの共有 URL に差し替えてください。";

    googleFormLink.href = contact.googleFormUrl ?? googleFormLink.href;
    microsoftFormLink.href = contact.microsoftFormUrl ?? microsoftFormLink.href;

    contactDirect.innerHTML = `
      <li>電話: ${company.phone ?? "-"}</li>
      <li>メール: ${company.email ?? "-"}</li>
      <li>受付時間: ${company.hours ?? "-"}</li>
    `;

    recommendedPlatformTitle.textContent = preferred.title;
    recommendedPlatformBody.textContent = preferred.body;
  } catch (error) {
    contactLead.textContent =
      error instanceof Error ? error.message : "問い合わせ設定の読み込みに失敗しました。";
    recommendedPlatformBody.textContent =
      "site-data.json が読めない場合でも、フォーム URL を直接 contact.html に記述すれば運用は可能です。";
  }
}

main();
