function onFormSubmit(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("responses");
  const row = e.range.getRow();
  const values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const record = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  const inquiryId = "INQ-" + Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyyMMdd-HHmmss");

  const statusColumn = headers.indexOf("status") + 1;
  const inquiryIdColumn = headers.indexOf("inquiry_id") + 1;
  const replySentAtColumn = headers.indexOf("reply_sent_at") + 1;

  if (inquiryIdColumn > 0) {
    sheet.getRange(row, inquiryIdColumn).setValue(inquiryId);
  }

  if (statusColumn > 0) {
    sheet.getRange(row, statusColumn).setValue("受付済み");
  }

  const internalBody = [
    "新しい問い合わせが届きました。",
    "",
    "問い合わせID: " + inquiryId,
    "氏名: " + (record.name || ""),
    "メール: " + (record.email || ""),
    "電話番号: " + (record.phone || ""),
    "エリア: " + (record.area || ""),
    "物件種別: " + (record.property_type || ""),
    "カテゴリ: " + (record.category || ""),
    "希望時期: " + (record.preferred_date || ""),
    "",
    "相談内容:",
    record.message || "",
  ].join("\n");

  GmailApp.sendEmail(
    "contact@seikan-renovation.example",
    "新しい問い合わせが届きました: " + inquiryId,
    internalBody
  );

  if (record.email) {
    const replyBody = [
      (record.name || "") + " 様",
      "",
      "このたびは、星環リノベーション株式会社へお問い合わせいただきありがとうございます。",
      "以下の内容で受け付けました。",
      "",
      "問い合わせID: " + inquiryId,
      "ご相談カテゴリ: " + (record.category || ""),
      "物件種別: " + (record.property_type || ""),
      "ご希望エリア: " + (record.area || ""),
      "希望時期: " + (record.preferred_date || ""),
      "",
      "ご相談内容:",
      record.message || "",
      "",
      "内容を確認のうえ、2営業日以内を目安に担当者よりご連絡いたします。",
    ].join("\n");

    GmailApp.sendEmail(
      record.email,
      "お問い合わせありがとうございます",
      replyBody
    );

    if (replySentAtColumn > 0) {
      sheet.getRange(row, replySentAtColumn).setValue(new Date());
    }
  }
}
