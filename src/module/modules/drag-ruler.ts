// import { CharacterGURPS } from "@actor"
// import { TokenGURPS } from "@module/canvas/index.ts"
//
// export const init = function (): void {
// 	Hooks.once("dragRuler.ready", SpeedProvider => {
// 		class SpeedProviderGURPS extends SpeedProvider {
// 			get colors() {
// 				return [
// 					{ id: "walk", default: 0x00ff00, name: "gurps.modules.drag_ruler.walk" },
// 					{ id: "sprint", default: 0xffff00, name: "gurps.modules.drag_ruler.sprint" },
// 					{ id: "fly", default: 0xff8000, name: "gurps.modules.drag_ruler.fly" },
// 				]
// 			}
//
// 			getRanges(token: TokenGURPS) {
// 				const actor = token.actor as CharacterGURPS
// 				const ranges = [
// 					{ range: actor.effectiveMove, color: "walk" },
// 					{ range: actor.effectiveSprint, color: "sprint" },
// 				]
// 				return ranges
// 			}
// 		}
//
// 		dragRuler.registerSystem(SYSTEM_NAME, SpeedProviderGURPS)
// 	})
// }
