# 問い合わせ運用メモ

このサイトの `contact.html` は、`src/site-data.json` にあるフォーム URL を参照して表示する前提です。

## 1. フォーム URL の差し替え

`src/site-data.json` の以下を実際の URL に変更します。

```json
{
  "contact": {
    "preferredPlatform": "google",
    "googleFormUrl": "https://docs.google.com/forms/d/e/xxxxx/viewform",
    "microsoftFormUrl": "https://forms.office.com/r/xxxxx"
  }
}
```

変更後に `npm run generate` を実行し、`dist/` を更新してください。

## 2. Google Forms を使う場合

おすすめ構成:

1. Google Form を作成する
2. 回答先を Google スプレッドシートへ連携する
3. Apps Script をそのスプレッドシートに紐付ける
4. `onFormSubmit` トリガーで以下を行う
   - 問い合わせ内容を整形
   - 担当者へ通知メール送信
   - 受付完了メールを送信者へ自動返信

Apps Script でよく入れる項目:

- 問い合わせ ID
- 受付日時
- 氏名
- メールアドレス
- 電話番号
- 相談カテゴリ
- 相談内容
- 対応ステータス
- 担当者

推奨シート構成:

- スプレッドシート名: `星環リノベーション_問い合わせ管理`
- タブ名: `responses`
- ヘッダー: `inquiry_id`, `received_at`, `name`, `email`, `phone`, `area`, `property_type`, `category`, `message`, `preferred_date`, `status`, `assignee`, `reply_sent_at`, `internal_note`

## 3. Microsoft Forms を使う場合

おすすめ構成:

1. Microsoft Forms でフォームを作成する
2. 回答を Excel に保存する
3. Power Automate で「新規回答が送信されたとき」をトリガーにする
4. 以下を自動化する
   - 社内通知メール送信
   - 送信者への受付完了メール送信
   - Teams 通知
   - 対応管理リストへの登録

## 4. 実際にフォームで聞くとよい項目

- 氏名
- メールアドレス
- 電話番号
- 住所またはエリア
- 物件種別
- 相談内容
- 希望時期
- 現地調査希望の有無

## 5. このリポジトリでの扱い

- 表示設定: `src/site-data.json`
- 問い合わせページ本体: `src/contact.html`
- 問い合わせページの設定反映: `src/contact.js`
- 問い合わせ管理シートひな形: `src/inquiry-sheet-template.csv`
- Google Apps Script サンプル: `src/google-apps-script-sample.js`
