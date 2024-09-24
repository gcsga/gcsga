export namespace prereq {
	export enum Type {
		List = "prereq_list",
		Trait = "trait_prereq",
		Attribute = "attribute_prereq",
		ContainedQuantity = "contained_quantity_prereq",
		ContainedWeight = "contained_weight_prereq",
		EquippedEquipment = "equipped_equipment",
		Skill = "skill_prereq",
		Spell = "spell_prereq",
	}

	export namespace Type {
		export function toString(T: Type): string {
			return `GURPS.Enum.prereq.${T}`
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
		Type.Spell,
	]

	export const TypesChoices: Readonly<Record<Type, string>> = Object.freeze({
		[Type.List]: Type.toString(Type.List),
		[Type.Trait]: Type.toString(Type.Trait),
		[Type.Attribute]: Type.toString(Type.Attribute),
		[Type.ContainedQuantity]: Type.toString(Type.ContainedQuantity),
		[Type.ContainedWeight]: Type.toString(Type.ContainedWeight),
		[Type.EquippedEquipment]: Type.toString(Type.EquippedEquipment),
		[Type.Skill]: Type.toString(Type.Skill),
		[Type.Spell]: Type.toString(Type.Spell),
	})

	export const TypesWithoutList: Type[] = [
		Type.Trait,
		Type.Attribute,
		Type.ContainedQuantity,
		Type.ContainedWeight,
		Type.EquippedEquipment,
		Type.Skill,
		Type.Spell,
	]
}
