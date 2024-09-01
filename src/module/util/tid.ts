import { ActorType, ItemType } from "@module/data/constants.ts"
import { ItemKind } from "@module/data/types.ts"
import { ErrorGURPS } from "@util"

type TIDString = `${ItemKind}${string}`
type StrictTIDString<TKind extends ItemKind> = `${TKind}${string}`

const KindAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

class TID {
	static init(kind: ItemKind): TIDString {
		const buffer = Array.from({ length: 12 }, () => Math.floor(Math.random() * 256))
		const randomId = btoa(String.fromCharCode.apply(null, buffer)).replaceAll("+", "-").replaceAll("/", "_")
		return `${kind}${randomId}`
	}

	static fromDocumentType(type: ActorType | ItemType): TIDString {
		const kind = (() => {
			switch (type) {
				case ItemType.Trait:
					return ItemKind.Trait
				case ItemType.TraitContainer:
					return ItemKind.TraitContainer
				case ItemType.TraitModifier:
					return ItemKind.TraitModifier
				case ItemType.TraitModifierContainer:
					return ItemKind.TraitModifierContainer
				case ItemType.Skill:
					return ItemKind.Skill
				case ItemType.Technique:
					return ItemKind.Technique
				case ItemType.SkillContainer:
					return ItemKind.SkillContainer
				case ItemType.Spell:
					return ItemKind.Spell
				case ItemType.RitualMagicSpell:
					return ItemKind.RitualMagicSpell
				case ItemType.SpellContainer:
					return ItemKind.SpellContainer
				case ItemType.Equipment:
					return ItemKind.Equipment
				case ItemType.EquipmentContainer:
					return ItemKind.EquipmentContainer
				case ItemType.EquipmentModifier:
					return ItemKind.EquipmentModifier
				case ItemType.EquipmentModifierContainer:
					return ItemKind.EquipmentModifierContainer
				case ItemType.Note:
					return ItemKind.Note
				case ItemType.NoteContainer:
					return ItemKind.NoteContainer
				// case ItemType.LegacyItem: return ItemKind.Equipment
				case ItemType.Effect:
					return ItemKind.Effect
				case ItemType.Condition:
					return ItemKind.Condition
				case ItemType.WeaponMelee:
					return ItemKind.WeaponMelee
				case ItemType.WeaponRanged:
					return ItemKind.WeaponRanged
				case ActorType.Character:
					return ItemKind.Entity
			}
			throw ErrorGURPS("Invalid Document Type")
		})()

		return TID.init(kind)
	}

	static typeFromKind(kind: ItemKind): ActorType | ItemType {
		switch (kind) {
			case ItemKind.Trait:
				return ItemType.Trait
			case ItemKind.TraitContainer:
				return ItemType.TraitContainer
			case ItemKind.TraitModifier:
				return ItemType.TraitModifier
			case ItemKind.TraitModifierContainer:
				return ItemType.TraitModifierContainer
			case ItemKind.Skill:
				return ItemType.Skill
			case ItemKind.Technique:
				return ItemType.Technique
			case ItemKind.SkillContainer:
				return ItemType.SkillContainer
			case ItemKind.Spell:
				return ItemType.Spell
			case ItemKind.RitualMagicSpell:
				return ItemType.RitualMagicSpell
			case ItemKind.SpellContainer:
				return ItemType.SpellContainer
			case ItemKind.Equipment:
				return ItemType.Equipment
			case ItemKind.EquipmentContainer:
				return ItemType.EquipmentContainer
			case ItemKind.EquipmentModifier:
				return ItemType.EquipmentModifier
			case ItemKind.EquipmentModifierContainer:
				return ItemType.EquipmentModifierContainer
			case ItemKind.Note:
				return ItemType.Note
			case ItemKind.NoteContainer:
				return ItemType.NoteContainer
			// case ItemKind.LegacyItem: return ItemType.Equipment
			case ItemKind.Effect:
				return ItemType.Effect
			case ItemKind.Condition:
				return ItemType.Condition
			case ItemKind.WeaponMelee:
				return ItemType.WeaponMelee
			case ItemKind.WeaponRanged:
				return ItemType.WeaponMelee
			case ItemKind.Entity:
				return ActorType.Character
			default:
				throw ErrorGURPS(`Item kind "${kind}" has no corresponding type`)
		}
	}

	static isValidAndItem(id: TIDString | string | unknown): boolean {
		if (typeof id !== "string") return false
		if (!TID.isValid(id)) return false
		return (Object.values(ItemType) as string[]).includes(TID.typeFromKind(id[0] as ItemKind))
	}

	static isValidAndActor(id: TIDString | string | unknown): boolean {
		if (typeof id !== "string") return false
		if (!TID.isValid(id)) return false
		return (Object.values(ActorType) as string[]).includes(TID.typeFromKind(id[0] as ItemKind))
	}

	static isValid(id: TIDString | string | unknown): boolean {
		if (typeof id !== "string") return false
		if (id.length !== 17 || !KindAlphabet.includes(id[0])) return false
		try {
			atob(id.substring(1).replaceAll("-", "+").replaceAll("_", "/"))
			return true
		} catch (err) {
			return false
		}
	}

	static fromString(id: string): TIDString {
		if (TID.isValid(id)) return id as TIDString
		throw ErrorGURPS("Invalid TID")
	}
}

export { TID, type TIDString, type StrictTIDString }
