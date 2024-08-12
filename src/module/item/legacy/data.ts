import { BaseItemSourceGURPS } from "@item/base/data.ts"
import { ItemSystemModel, ItemSystemSchema } from "@item/base/schema.ts"
import { ItemType } from "@module/data/constants.ts"
import { LegacyItemGURPS } from "./document.ts"
import fields = foundry.data.fields

// NOTE: this code is intentionally unused and unfinished pending review of whether this level of legacy support is needed

type indexString = `${number}${number}${number}${number}${number}`

class LegacyItemSystemData extends ItemSystemModel<LegacyItemGURPS, LegacyItemSystemSchema> {
	static override defineSchema(): LegacyItemSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			ads: new fields.ObjectField(),
			melee: new fields.ObjectField(),
			ranged: new fields.ObjectField(),
			skills: new fields.ObjectField(),
			spells: new fields.ObjectField(),
		}
	}
}

interface LegacyItemSystemData
	extends ItemSystemModel<LegacyItemGURPS, LegacyItemSystemSchema>,
		ModelPropsFromSchema<LegacyItemSystemSchema> {}

type LegacyItemSystemSchema = ItemSystemSchema & {
	ads: fields.ObjectField<LegacyItemList<VirtualTrait>>
	melee: fields.ObjectField<LegacyItemList<VirtualMeleeWeapon>>
	ranged: fields.ObjectField<LegacyItemList<VirtualRangedWeapon>>
	skills: fields.ObjectField<LegacyItemList<VirtualSkill>>
	spells: fields.ObjectField<LegacyItemList<VirtualSpell>>
}

type LegacyItemList<TType extends VirtualItem> = {
	[key: indexString]: TType
}

type VirtualItem = {}

type VirtualTrait = VirtualItem & {}

type VirtualMeleeWeapon = VirtualItem & {}

type VirtualRangedWeapon = VirtualItem & {}

type VirtualSkill = VirtualItem & {}

type VirtualSpell = VirtualItem & {}

type LegacyItemSystemSource = SourceFromSchema<LegacyItemSystemSchema>

type LegacyItemSource = BaseItemSourceGURPS<ItemType.LegacyItem, LegacyItemSystemSource>

export type { LegacyItemSource, LegacyItemSystemData }
