export function doUintsMatch (uint1: Uint8Array, uint2: Uint8Array) {
  if (uint1.byteLength !== uint2.byteLength) return false

  return uint1.every((val, i) => val === uint2[i])
}
