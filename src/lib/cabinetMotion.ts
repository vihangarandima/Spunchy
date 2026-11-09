// GSAP plugins only the cabinet uses, split out of the main bundle and loaded when the
// cabinet mounts (src/sections/Cabinet.tsx).
import { gsap } from './motion'
import { Flip } from 'gsap/Flip'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'

gsap.registerPlugin(Flip, Draggable, InertiaPlugin)

export { Flip, Draggable }
