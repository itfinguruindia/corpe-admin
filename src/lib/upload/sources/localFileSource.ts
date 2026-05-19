export interface LocalFilePickOptions {
  accept?: string;
  multiple?: boolean;
}

export function pickLocalFile(
  options: LocalFilePickOptions = {},
): Promise<File | File[] | null> {
  const { accept, multiple = false } = options;

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    if (accept) input.accept = accept;
    if (multiple) input.multiple = true;

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        resolve(null);
        return;
      }
      if (multiple) {
        resolve(Array.from(files));
        return;
      }
      resolve(files[0] ?? null);
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
}
