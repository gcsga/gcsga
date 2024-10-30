import { ActorType, EffectType, ItemType } from "@data"
import * as EffectInstance from "@module/data/active-effect/index.ts"
import * as ActorInstance from "@module/data/actor/index.ts"
import { ItemsGURPS } from "@module/data/collections/items-collection.ts"
import * as ItemInstance from "@module/data/item/index.ts"
import { AncestryData } from "@module/data/journal-entry-page/ancestry.ts"
import { AttackRoll, BasicRoll, DamageRoll, SuccessRoll } from "@module/dice/index.ts"
import { ActorGURPS2 } from "@module/documents/actor.ts"
import { ChatMessageGURPS } from "@module/documents/chat-message.ts"
import { CombatGURPS } from "@module/documents/combat.ts"
import { CombatantGURPS } from "@module/documents/combatant.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { ActiveEffectGURPS } from "@module/documents/active-effect.ts"
import { TokenDocumentGURPS } from "@module/documents/token.ts"
import { UserGURPS } from "@module/documents/user.ts"

export const Load = {
	listen(): void {
		// Assign database backend to handle migrations
		// CONFIG.DatabaseBackend = new ClientDatabaseBackendGURPS()

		// Assign document classes
		CONFIG.Actor.documentClass = ActorGURPS2
		CONFIG.ChatMessage.documentClass = ChatMessageGURPS
		CONFIG.ActiveEffect.documentClass = ActiveEffectGURPS
		CONFIG.Combat.documentClass = CombatGURPS
		CONFIG.Combatant.documentClass = CombatantGURPS
		CONFIG.Item.documentClass = ItemGURPS2
		CONFIG.Item.collection = ItemsGURPS<ItemGURPS2<null>>
		CONFIG.Macro.documentClass = Macro
		CONFIG.MeasuredTemplate.documentClass = MeasuredTemplateDocument
		// CONFIG.JournalEntry.documentClass = JournalEntryGURPS
		// CONFIG.JournalEntryPage.documentClass = JournalEntryPageProxyGURPS
		CONFIG.Token.documentClass = TokenDocumentGURPS
		CONFIG.User.documentClass = UserGURPS

		CONFIG.Dice.rolls = [BasicRoll, SuccessRoll, AttackRoll, DamageRoll]
		CONFIG.Dice.Basic = BasicRoll
		CONFIG.Dice.Success = SuccessRoll
		CONFIG.Dice.Attack = AttackRoll
		CONFIG.Dice.Damage = DamageRoll

		// @ts-expect-error infinite type
		CONFIG.Actor.dataModels = {
			[ActorType.Character]: ActorInstance.CharacterDataGURPS,
		}

		// @ts-expect-error infinite type
		CONFIG.Item.dataModels = {
			// [ItemType.Condition]: ItemInstance.ConditionData,
			// [ItemType.Effect]: ItemInstance.EffectData,
			[ItemType.EquipmentContainer]: ItemInstance.EquipmentContainerData,
			[ItemType.EquipmentModifierContainer]: ItemInstance.EquipmentModifierContainerData,
			[ItemType.EquipmentModifier]: ItemInstance.EquipmentModifierData,
			[ItemType.Equipment]: ItemInstance.EquipmentData,
			[ItemType.NoteContainer]: ItemInstance.NoteContainerData,
			[ItemType.Note]: ItemInstance.NoteData,
			[ItemType.RitualMagicSpell]: ItemInstance.RitualMagicSpellData,
			[ItemType.SkillContainer]: ItemInstance.SkillContainerData,
			[ItemType.Skill]: ItemInstance.SkillData,
			[ItemType.SpellContainer]: ItemInstance.SpellContainerData,
			[ItemType.Spell]: ItemInstance.SpellData,
			[ItemType.Technique]: ItemInstance.TechniqueData,
			[ItemType.TraitContainer]: ItemInstance.TraitContainerData,
			[ItemType.TraitModifierContainer]: ItemInstance.TraitModifierContainerData,
			[ItemType.TraitModifier]: ItemInstance.TraitModifierData,
			[ItemType.Trait]: ItemInstance.TraitData,
			[ItemType.WeaponMelee]: ItemInstance.WeaponMeleeData,
			[ItemType.WeaponRanged]: ItemInstance.WeaponRangedData,
		}

		CONFIG.ActiveEffect.dataModels = {
			// @ts-expect-error doesn't like parent type
			[EffectType.Effect]: EffectInstance.EffectData,
			// @ts-expect-error doesn't like parent type
			[EffectType.Condition]: EffectInstance.ConditionData,
		}

		CONFIG.JournalEntryPage.dataModels = {
			ancestry: AncestryData,
		}

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
			// [ActorType.LegacyCharacter]: "gcs-character",
			// [ActorType.LegacyEnemy]: "gcs-character",
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
			// [ItemType.LegacyItem]: "gcs-equipment",
			// [ItemType.Effect]: "gcs-effect",
			// [ItemType.Condition]: "gcs-condition",
			[ItemType.WeaponMelee]: "gcs-melee-weapon",
			[ItemType.WeaponRanged]: "gcs-ranged-weapon",
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
