/**
 * Client-side DOCX text extraction - no dependencies, no upload.
 *
 * A .docx file is a ZIP archive whose `word/document.xml` holds the document
 * body. This reader walks the ZIP central directory, pulls that entry out and
 * inflates it with the browser's native DecompressionStream, so nothing ever
 * leaves the user's machine.
 *
 * Supported compression: stored (0) and deflate (8) - what Word itself writes.
 */

const EOCD_SIG = 0x06054b50;
const CEN_SIG = 0x02014b50;

function readU32(b: Uint8Array, i: number): number {
  return (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0;
}

function readU16(b: Uint8Array, i: number): number {
  return b[i] | (b[i + 1] << 8);
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("UNSUPPORTED_BROWSER");
  }
  const stream = new Blob([data as unknown as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

function xmlToText(xml: string): string {
  return xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:tab[^>]*\/>/g, "\t")
    .replace(/<w:br[^>]*\/>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");
}

export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);

  // Locate the End Of Central Directory record (scan back past any comment).
  let eocd = -1;
  const minEocd = Math.max(0, bytes.length - 22 - 65535);
  for (let i = bytes.length - 22; i >= minEocd; i--) {
    if (readU32(bytes, i) === EOCD_SIG) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("NOT_A_ZIP");

  const entryCount = readU16(bytes, eocd + 10);
  let off = readU32(bytes, eocd + 16);

  // Walk the central directory looking for word/document.xml.
  let target: { method: number; compSize: number; localOff: number } | null = null;
  for (let n = 0; n < entryCount && off + 46 <= bytes.length; n++) {
    if (readU32(bytes, off) !== CEN_SIG) break;
    const nameLen = readU16(bytes, off + 28);
    const extraLen = readU16(bytes, off + 30);
    const commentLen = readU16(bytes, off + 32);
    const name = new TextDecoder().decode(bytes.subarray(off + 46, off + 46 + nameLen));
    if (name === "word/document.xml") {
      target = {
        method: readU16(bytes, off + 10),
        compSize: readU32(bytes, off + 20),
        localOff: readU32(bytes, off + 42),
      };
    }
    off += 46 + nameLen + extraLen + commentLen;
  }
  if (!target) throw new Error("NO_DOCUMENT_XML");

  // Skip the local file header to reach the compressed data.
  const lh = target.localOff;
  if (readU32(bytes, lh) !== 0x04034b50) throw new Error("CORRUPT_ZIP");
  const lNameLen = readU16(bytes, lh + 26);
  const lExtraLen = readU16(bytes, lh + 28);
  const dataStart = lh + 30 + lNameLen + lExtraLen;
  const data = bytes.subarray(dataStart, dataStart + target.compSize);

  let xmlBytes: Uint8Array;
  if (target.method === 0) {
    xmlBytes = data;
  } else if (target.method === 8) {
    xmlBytes = await inflateRaw(data);
  } else {
    throw new Error("UNSUPPORTED_COMPRESSION");
  }

  return xmlToText(new TextDecoder().decode(xmlBytes));
}
