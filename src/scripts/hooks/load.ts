import { ActorProxyGURPS } from "@actor"
import { ItemProxyGURPS } from "@item"
import { ActiveEffectGURPS } from "@module/active-effect/index.ts"
import { ChatMessageGURPS } from "@module/chat-message/document.ts"
import { CombatGURPS } from "@module/combat/document.ts"
import { CombatantGURPS } from "@module/combatant/document.ts"
import { UserGURPS } from "@module/user/index.ts"
import { SceneGURPS } from "@scene"
import { TokenDocumentGURPS } from "@scene/token-document/document.ts"
import { TokenConfigGURPS } from "@scene/token-document/sheet.ts"
import { ClientDatabaseBackendGURPS } from "@sytem/client-backend.ts"

export const Load = {
	listen(): void {
		// Assign database backend to handle migrations
		CONFIG.DatabaseBackend = new ClientDatabaseBackendGURPS()

		// Assign document classes
		CONFIG.ActiveEffect.documentClass = ActiveEffectGURPS
		CONFIG.Actor.collection = Actors
		CONFIG.Actor.documentClass = ActorProxyGURPS
		CONFIG.ActorDelta.documentClass = ActorDelta
		CONFIG.AmbientLight.documentClass = AmbientLightDocument
		CONFIG.ChatMessage.documentClass = ChatMessageGURPS
		CONFIG.Combat.documentClass = CombatGURPS
		CONFIG.Combatant.documentClass = CombatantGURPS
		CONFIG.Item.documentClass = ItemProxyGURPS
		CONFIG.Macro.documentClass = Macro
		CONFIG.MeasuredTemplate.documentClass = MeasuredTemplateDocument
		CONFIG.Scene.documentClass = SceneGURPS
		CONFIG.Tile.documentClass = TileDocument
		CONFIG.Token.documentClass = TokenDocumentGURPS
		CONFIG.Token.prototypeSheetClass = TokenConfigGURPS
		CONFIG.User.documentClass = UserGURPS

		CONFIG.Canvas.darknessColor = 0x2d2d52 // Lightness increased by ~0.4/10 (Munsell value)
		CONFIG.Canvas.exploredColor = 0x262626 // Increased from 0 (black)

		// CONFIG.Dice.rolls.push(CheckRoll, StrikeAttackRoll, DamageRoll, DamageInstance)
		// for (const TermCls of [ArithmeticExpression, Grouping, InstancePool, IntermediateDie]) {
		// 	CONFIG.Dice.termTypes[TermCls.name] = TermCls
		// }

		// Add functions to the `Math` namespace for use in `Roll` formulas
		Math.eq = (a: number, b: number): boolean => a === b
		Math.gt = (a: number, b: number): boolean => a > b
		Math.gte = (a: number, b: number): boolean => a >= b
		Math.lt = (a: number, b: number): boolean => a < b
		Math.lte = (a: number, b: number): boolean => a <= b
		Math.ne = (a: number, b: number): boolean => a !== b
		Math.ternary = (condition: boolean | number, ifTrue: number, ifFalse: number): number =>
			condition ? ifTrue : ifFalse

		// Mystery Man but with a drop shadow
		Actor.DEFAULT_ICON = "systems/pf2e/icons/default-icons/mystery-man.svg"

		// Inline link icons
		CONFIG.Actor.typeIcons = {
			familiar: "fa-solid fa-cat",
			hazard: "fa-solid fa-hill-rockslide",
			loot: "fa-solid fa-treasure-chest",
		}
		CONFIG.Item.typeIcons = {
			action: "fa-solid fa-person-running-fast",
			affliction: "fa-solid fa-biohazard",
			armor: "fa-solid fa-shirt-long-sleeve",
			backpack: "fa-solid fa-sack",
			book: "fa-solid fa-book",
			condition: "fa-solid fa-face-zany",
			consumable: "fa-solid fa-flask-round-potion",
			deity: "fa-solid fa-hamsa",
			effect: "fa-solid fa-person-rays",
			equipment: "fa-solid fa-hat-cowboy",
			feat: "fa-solid fa-medal",
			shield: "fa-solid fa-shield-halved",
			spell: "fa-solid fa-sparkles",
			treasure: "fa-solid fa-gem",
			weapon: "fa-solid fa-sword",
		}

		// Make available immediately on load for module subclassing
		// window.AutomaticBonusProgression = AutomaticBonusProgression

		// Monkey-patch `TextEditor.enrichHTML`
		// monkeyPatchFoundry()

		// Prevent buttons from retaining focus when clicked so that canvas hotkeys still work
		document.addEventListener("mouseup", (): void => {
			const element = document.activeElement
			if (element instanceof HTMLButtonElement && !element.classList.contains("pm-dropdown")) {
				element.blur()
			}
		})
	},
}
