/* eslint-disable @typescript-eslint/consistent-type-imports */
/// <reference types="node" />

declare namespace BlobStream {
  interface IBlobStream extends NodeJS.WritableStream {
    toBlob(type?: string): Blob;
    toBlobURL(type?: string): string;
  }
}

declare function BlobStream(): BlobStream.IBlobStream;

interface Window {
  PDFDocument: typeof import("pdfkit");
  blobStream: typeof BlobStream;
}
