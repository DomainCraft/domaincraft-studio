let wasmReady = false;
let wasmLoading = false;
let wasmLoadError = false;
let onReadyCallbacks: Array<() => void> = [];

declare global {
  interface Window {
    Go: new () => {
      importObject: Record<string, WebAssembly.ModuleImports>;
      run(instance: WebAssembly.Instance): void;
    };
    goValidate?: (yamlText: string) => string;
    goParseField?: (fieldDef: string, fieldName?: string) => string;
    goParseDomain?: (yamlText: string) => string;
    goVersion?: () => string;
  }
}

const wasmBaseUrl = `${import.meta.env.BASE_URL}wasm/`;

export async function loadWasmValidator(): Promise<boolean> {
  if (wasmReady) return true;
  if (wasmLoading || wasmLoadError) return false;

  wasmLoading = true;
  try {
    if (!window.Go) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `${wasmBaseUrl}wasm_exec.js`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load wasm_exec.js'));
        document.head.appendChild(script);
      });
    }

    const go = new window.Go();
    const result = await WebAssembly.instantiateStreaming(
      fetch(`${wasmBaseUrl}validate.wasm`),
      go.importObject,
    );
    go.run(result.instance);
    wasmReady = true;
    wasmLoading = false;
    for (const cb of onReadyCallbacks) cb();
    onReadyCallbacks = [];
    return true;
  } catch (e) {
    console.warn('WASM validator not available:', e);
    wasmLoading = false;
    wasmLoadError = true;
    return false;
  }
}

export function isWasmReady(): boolean {
  return wasmReady;
}

export function getWasmVersion(): string | null {
  return typeof window.goVersion === 'function' ? window.goVersion() : null;
}

export function onWasmReady(callback: () => void): () => void {
  if (wasmReady) {
    callback();
    return () => {};
  }
  onReadyCallbacks.push(callback);
  return () => {
    onReadyCallbacks = onReadyCallbacks.filter((cb) => cb !== callback);
  };
}
