import { LocalizeGURPS } from "@util/localize"

export namespace prereq {
	export enum Type {
		List = "prereq_list",
		Trait = "trait_prereq",
		Attribute = "attribute_prereq",
		ContainedQuantity = "contained_quantity_prereq",
		ContainedWeight = "contained_weight_prereq",
		EquippedEquipment = "equipped_equipment",
		Skill = "skill_prereq",
		Spell = "spell_prereq"
	}

	export namespace Type {
		export function toString(T: Type): string {
			return LocalizeGURPS.translations.gurps.enum.prereq[T]
		}
	}

	export const Types: Type[] = [
		Type.List,
		Type.Trait,
		Type.Attribute,
		Type.ContainedQuantity,
		Type.ContainedWeight,
		Type.EquippedEquipment,
		Type.Skill,
		Type.Spell
	]
}
