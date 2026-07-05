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

  GmailApp.sendEmail(
    "contact@seikan-renovation.example",
    "新しい問い合わせが届きました: " + inquiryId,
    [
      "問い合わせID: " + inquiryId,
      "氏名: " + (record.name || ""),
      "メール: " + (record.email || ""),
      "電話番号: " + (record.phone || ""),
      "エリア: " + (record.area || ""),
      "相談内容:",
      record.message || "",
    ].join("\n")
  );

  if (record.email) {
    GmailApp.sendEmail(
      record.email,
      "お問い合わせありがとうございます",
      [
        record.name + " 様",
        "",
        "お問い合わせありがとうございます。",
        "以下の内容で受け付けました。",
        "",
        "問い合わせID: " + inquiryId,
        "ご相談内容: " + (record.message || ""),
        "",
        "担当者より順次ご連絡いたします。",
      ].join("\n")
    );

    if (replySentAtColumn > 0) {
      sheet.getRange(row, replySentAtColumn).setValue(new Date());
    }
  }
}
