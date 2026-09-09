/**
 * How brightly the room's lamp is burning, 0 to 1.
 *
 * A plain mutable box rather than store state: it changes every frame while
 * the lamp warms up, and pushing that through React would re-render the whole
 * scene sixty times a second to move one number. The lamp writes it; anything
 * that has to follow the light reads it inside its own frame callback.
 */
export const lampLevel = { value: 0 }
