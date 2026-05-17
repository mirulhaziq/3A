import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

async function parseCV(buffer: Buffer, mimetype: string): Promise<string> {
  let rawText: string;

  if (mimetype === 'application/pdf') {
    const result = await pdfParse(buffer);
    rawText = result.text;
  } else if (
    mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    rawText = result.value;
  } else {
    throw new Error(`Unsupported mimetype: ${mimetype}`);
  }

  return rawText
    .trim()
    .replace(/[^\x20-\x7E\t\n\r]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export { parseCV };
