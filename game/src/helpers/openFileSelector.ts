export function openFileSelector(type: string): Promise<File | null> {
  const input: HTMLInputElement = document.createElement('input');
  input.type = 'file';
  input.accept = type;
  input.click();

  return new Promise(resolve => {
    input.onchange = () => {
      const file = input.files?.item(0);
      if (file) resolve(file);
      else resolve(null);
    };
  });
}
