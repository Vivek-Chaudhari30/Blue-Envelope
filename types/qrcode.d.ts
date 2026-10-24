// Minimal type surface for the bits of qrcode we use (toDataURL).
// We avoid @types/qrcode because the dev-install command tripped an
// over-broad data-exfiltration pattern ('-d @'); this is the equivalent.
declare module "qrcode" {
  export function toDataURL(
    text: string,
    opts?: { width?: number; margin?: number; color?: { dark?: string; light?: string } },
  ): Promise<string>;
  const _default: { toDataURL: typeof toDataURL };
  export default _default;
}
