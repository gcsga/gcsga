import {
	AbstractContainerSource,
} from "@item/abstract-container/data.ts"
import { ItemType, gid } from "@module/data/constants.ts"
import { SkillDifficulty } from "@module/data/types.ts"
import { FeatureObj, PrereqList, SkillDefault, SkillDefaultSchema, } from "@system"
import { LocalizeGURPS, TooltipGURPS, difficulty, } from "@util"
import { SkillGURPS } from "./document.ts"
import fields = foundry.data.fields
import { PrereqListSchema } from "@system/prereq/prereq-list.ts"
import { AbstractSkillSystemData, AbstractSkillSystemSchema } from "@item/abstract-skill/data.ts"

class SkillSystemData extends AbstractSkillSystemData<SkillGURPS, SkillSystemSchema> {
	static override defineSchema(): SkillSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.Skill }),
			name: new fields.StringField({
				required: true,
				initial: LocalizeGURPS.translations.TYPES.Item[ItemType.Skill],
			}),
			specialization: new fields.StringField(),
			difficulty: new fields.StringField({ initial: `${gid.Dexterity}/${difficulty.Level.Average}`, required: true }),
			encumbrance_penalty_multiplier: new fields.NumberField({ integer: true, min: 0, max: 9, initial: 0 }),
			defaulted_from: new fields.SchemaField(SkillDefault.defineSchema()),
			defaults: new fields.ArrayField(new fields.SchemaField(SkillDefault.defineSchema())),
			prereqs: new fields.SchemaField(PrereqList.defineSchema()),
			features: new fields.ArrayField(new fields.ObjectField<FeatureObj>()),
		}


	}
}

interface SkillSystemData extends AbstractSkillSystemData<SkillGURPS, SkillSystemSchema>, ModelPropsFromSchema<SkillSystemSchema> { }

type SkillSystemSchema = AbstractSkillSystemSchema & {
	name: fields.StringField<string, string, true, false, true>
	type: fields.StringField<ItemType.Skill, ItemType.Skill, true, false, true>
	specialization: fields.StringField
	difficulty: fields.StringField<SkillDifficulty, SkillDifficulty, true>
	encumbrance_penalty_multiplier: fields.NumberField<number, number, true, false, true>
	defaulted_from: fields.SchemaField<SkillDefaultSchema>
	defaults: fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>
	prereqs: fields.SchemaField<PrereqListSchema>
	features: fields.ArrayField<fields.ObjectField<FeatureObj>>
}

type SkillSystemSource = SourceFromSchema<SkillSystemSchema>

type SkillSource = AbstractContainerSource<ItemType.Skill, SkillSystemSource>

interface SkillLevel {
	level: number
	relativeLevel: number
	tooltip: TooltipGURPS
}

export type { SkillLevel, SkillSource, SkillSystemData, SkillSystemSource }
