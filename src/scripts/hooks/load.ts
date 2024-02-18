import { ActorProxyGURPS } from "@actor"
import { ActorType, ItemType } from "@data"
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

		// Inline link icons
		CONFIG.Actor.typeIcons = {
			[ActorType.Character]: "gcs-character",
			[ActorType.LegacyCharacter]: "gcs-character",
			[ActorType.LegacyEnemy]: "gcs-character",
			[ActorType.Loot]: "fa-solid fa-gem",
		}
		CONFIG.Item.typeIcons = {
			[ItemType.Trait]: "gcs-trait",
			[ItemType.TraitContainer]: "gcs-trait",
			[ItemType.TraitModifier]: "gcs-modifier",
			[ItemType.TraitModifierContainer]: "gcs-modifier",
			[ItemType.Skill]: "gcs-skill",
			[ItemType.Technique]: "gcs-technique",
			[ItemType.SkillContainer]: "gcs-skill",
			[ItemType.Spell]: "gcs-spell",
			[ItemType.RitualMagicSpell]: "gcs-ritual-magic_spell",
			[ItemType.SpellContainer]: "gcs-spell",
			[ItemType.Equipment]: "gcs-equipment",
			[ItemType.EquipmentContainer]: "gcs-equipment",
			[ItemType.EquipmentModifier]: "gcs-eqp-modifier",
			[ItemType.EquipmentModifierContainer]: "gcs-eqp-modifier",
			[ItemType.Note]: "gcs-note",
			[ItemType.NoteContainer]: "gcs-note",
			[ItemType.LegacyEquipment]: "gcs-equipment",
			[ItemType.Effect]: "gcs-effect",
			[ItemType.Condition]: "gcs-condition",
			[ItemType.MeleeWeapon]: "gcs-melee-weapon",
			[ItemType.RangedWeapon]: "gcs-ranged-weapon",
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
