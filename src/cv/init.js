let Module = {
  wasmBinaryFile: './cv/cv-wasm.wasm',
  filePackagePrefixURL: './cv/',
  usingWasm: true,
}

importScripts('./cv/cv-wasm.js')
