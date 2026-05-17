import PdfPrinter from 'pdfmake';
import type { Content, ContentText, TDocumentDefinitions } from 'pdfmake/interfaces';

const fonts = {
  Roboto: {
    normal: 'node_modules/pdfmake/build/vfs_fonts.js',
    bold: 'node_modules/pdfmake/build/vfs_fonts.js',
    italics: 'node_modules/pdfmake/build/vfs_fonts.js',
    bolditalics: 'node_modules/pdfmake/build/vfs_fonts.js',
  },
};

async function exportCvAsPdf(cvText: string): Promise<Buffer> {
  const printer = new PdfPrinter(fonts);

  const sections = cvText.split('\n\n').filter(Boolean);

  const content: Content[] = sections.flatMap((section) => {
    const lines = section.split('\n');
    return [
      createTextContent(lines[0] ?? '', 'sectionHeader', [0, 8, 0, 4]),
      ...lines.slice(1).map((line) => ({
        text: line,
        style: 'body',
        margin: [0, 2, 0, 2] as [number, number, number, number],
      })),
    ];
  });

  const docDefinition: TDocumentDefinitions = {
    content,
    styles: {
      sectionHeader: {
        fontSize: 13,
        bold: true,
        color: '#1a1a2e',
      },
      body: {
        fontSize: 10,
        color: '#333333',
      },
    },
    defaultStyle: {
      font: 'Roboto',
    },
    pageMargins: [40, 60, 40, 60],
  };

  return new Promise((resolve, reject) => {
    try {
      const doc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function createTextContent(
  text: string,
  style: string,
  margin: [number, number, number, number]
): ContentText {
  return { text, style, margin };
}

export { exportCvAsPdf };
