
export function downloadBlob(binaryString: string, filename: string, contentType: string) {
  const blob = stringToBlob(binaryString, contentType);
  const link = document.createElement('a');
  link.download = filename;
  link.href = window.URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function stringToBlob(binaryString: string, contentType: string): Blob {
  const byteArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) byteArray[i] = binaryString.charCodeAt(i);
  return new Blob([byteArray], {type: contentType});
}

export function blobToString(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsBinaryString(blob);
  });
}
