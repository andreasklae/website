/** Resolves a derivative path to a URL, honouring Vite's base. */
export const assetUrl = (rel) => {
  const base = (import.meta?.env?.BASE_URL) || '/'
  return `${base}${String(rel).replace(/^\.?\//, '').split('/').map(encodeURIComponent).join('/')}`
}

/** Best available derivative for a slot, largest first. */
export const variantUrl = (slot, ...preferred) => {
  for (const name of preferred) {
    if (slot?.variants?.[name]) return assetUrl(`albums/${slot.variants[name]}`)
  }
  const any = slot?.variants && Object.values(slot.variants)[0]
  return any ? assetUrl(`albums/${any}`) : null
}
