# seikan-renovation-site

仮想のリフォーム会社「星環リノベーション株式会社」の静的サイトです。  
GitHub Pages にデプロイする前提で、以下の 4 ページ構成になっています。

- トップ
- 企業概要
- 施工事例
- お問い合わせ

## 特徴

- 紫ベースの宇宙テーマで、モダンなコーポレートサイトとして整えている
- 施工事例は `before / after` のフォルダ構成から自動で `manifest.json` を生成する
- 問い合わせページは Google Forms / Microsoft Forms の URL を設定ファイルで差し替えできる
- GitHub Actions で GitHub Pages に自動デプロイできる

## ディレクトリ構成

```text
images/
  case-01/
    before/
      living-before.png
    after/
      living-after.png
  case-02/
    before/
      kitchen-before.png
    after/
      kitchen-after.png
src/
  index.html
  about.html
  works.html
  contact.html
  contact.js
  inquiry-sheet-template.csv
  google-apps-script-sample.js
  works.js
  site-data.json
  styles.css
scripts/
  generate-site.mjs
docs/
  contact-ops.md
dist/
  ...
```

## 施工事例の追加方法

案件ごとに以下のような構成で画像を置きます。

```text
images/
└ case-03/
   ├ before/
   │  ├ room-before-1.jpg
   │  └ room-before-2.jpg
   └ after/
      ├ room-after-1.jpg
      └ room-after-2.jpg
```

その後、以下を実行します。

1. `npm run generate`
2. `npm run check`

## 問い合わせフォームの差し替え

`src/site-data.json` の URL を実際のフォームに差し替えてください。

```json
{
  "contact": {
    "preferredPlatform": "google",
    "googleFormUrl": "https://docs.google.com/forms/d/e/xxxxx/viewform",
    "microsoftFormUrl": "https://forms.office.com/r/xxxxx"
  }
}
```

フォーム送信後のスプレッドシート管理や通知メール運用は [docs/contact-ops.md](docs/contact-ops.md) に整理しています。
また、公開サイト上から直接参照できるテンプレートとして以下も置いています。

- `inquiry-sheet-template.csv`: 問い合わせ管理シートのひな形
- `google-apps-script-sample.js`: Google Form 送信後に通知と自動返信を行う Apps Script サンプル

## ローカル確認

1. `npm run generate`
2. プロジェクトルートでローカルサーバーを起動
   - 例: `python -m http.server 8000`
3. `http://localhost:8000/dist/` を開く

## コマンド

- `npm run generate`: `dist/` と `manifest.json` を再生成
- `npm run check`: 現在の `images/` 構成と `dist/manifest.json` が一致するか確認

## GitHub Pages

`main` ブランチへ push すると、`.github/workflows/deploy-pages.yml` により GitHub Pages へ自動デプロイされます。
