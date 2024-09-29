import { StringCriteria } from "@module/util/string-criteria.ts"
import fields = foundry.data.fields
import { feature, skillsel } from "@util"
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import { Nameable } from "@module/util/index.ts"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"

class SkillBonus extends BaseFeature<SkillBonusSchema> {
	static override TYPE = feature.Type.SkillBonus

	static override defineSchema(): SkillBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			selection_type: new fields.StringField({ choices: skillsel.Types, initial: skillsel.Type.Name }),
			name: new fields.EmbeddedDataField(StringCriteria),
			specialization: new fields.EmbeddedDataField(StringCriteria),
			tags: new fields.EmbeddedDataField(StringCriteria),
		}
	}

	constructor(data: DeepPartial<SourceFromSchema<SkillBonusSchema>>) {
		super(data)

		this.name = new StringCriteria(data.name)
		this.specialization = new StringCriteria(data.specialization)
		this.tags = new StringCriteria(data.tags)
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.specialization.qualifier, m, existing)
		if (this.selection_type !== skillsel.Type.ThisWeapon) {
			Nameable.extract(this.name.qualifier, m, existing)
			Nameable.extract(this.tags.qualifier, m, existing)
		}
	}
}

interface SkillBonus extends BaseFeature<SkillBonusSchema>, ModelPropsFromSchema<SkillBonusSchema> {}

type SkillBonusSchema = BaseFeatureSchema & {
	selection_type: fields.StringField<skillsel.Type>
	name: StringCriteriaField<true, false, true>
	specialization: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
}

export { SkillBonus, type SkillBonusSchema }
