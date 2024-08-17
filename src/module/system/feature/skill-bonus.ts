import { StringCriteria } from "@module/util/string-criteria.ts"
import { feature, skillsel } from "@util"
import { SkillBonusSchema } from "./data.ts"
import { BaseFeature } from "./base.ts"
import { Nameable } from "@module/util/nameable.ts"

class SkillBonus extends BaseFeature<SkillBonusSchema> {
	static override defineSchema(): SkillBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, nullable: false,  blank: false,initial: feature.Type.SkillBonus }),
			selection_type: new fields.StringField({ choices: skillsel.Types, initial: skillsel.Type.Name }),
			name: new fields.SchemaField(StringCriteria.defineSchema()),
			specialization: new fields.SchemaField(StringCriteria.defineSchema()),
			tags: new fields.SchemaField(StringCriteria.defineSchema()),
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

interface SkillBonus
	extends BaseFeature<SkillBonusSchema>,
		Omit<ModelPropsFromSchema<SkillBonusSchema>, "name" | "specialization" | "tags"> {
	name: StringCriteria
	specialization: StringCriteria
	tags: StringCriteria
}

export { SkillBonus }
