/**
 * Binding cloths. Muted enough to sit together on a shelf, but far enough
 * apart in hue and value to tell one album from another at a glance — the
 * previous set was five shades of the same dark brown.
 */
export const CLOTHS = [
  { cloth: '#6d5535', ink: '#f4ecdc' }, // tan
  { cloth: '#31473d', ink: '#eef2ec' }, // deep green
  { cloth: '#71392f', ink: '#f6e9e2' }, // oxblood
  { cloth: '#2f3d5c', ink: '#e9edf6' }, // navy
  { cloth: '#4e4a44', ink: '#f1efea' }, // warm grey
]

export const clothFor = (index) => CLOTHS[((index % CLOTHS.length) + CLOTHS.length) % CLOTHS.length]
