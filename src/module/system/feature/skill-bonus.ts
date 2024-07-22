import { StringCriteria } from "@module/util/string-criteria.ts"
import { skillsel } from "@util"
import { SkillBonusSchema } from "./data.ts"
import { BaseFeature, LeveledAmount } from "./base.ts"

class SkillBonus extends BaseFeature<SkillBonusSchema> {

	static override defineSchema(): SkillBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			...LeveledAmount.defineSchema(),
			selection_type: new fields.StringField({ choices: skillsel.Types, initial: skillsel.Type.Name }),
			name: new fields.SchemaField(StringCriteria.defineSchema()),
			specialization: new fields.SchemaField(StringCriteria.defineSchema()),
			tags: new fields.SchemaField(StringCriteria.defineSchema())
		}
	}

	constructor(data: DeepPartial<SourceFromSchema<SkillBonusSchema>>) {
		super(data)

		this.name = new StringCriteria(data.name)
		this.specialization = new StringCriteria(data.specialization)
		this.tags = new StringCriteria(data.tags)
	}

}

interface SkillBonus extends BaseFeature<SkillBonusSchema>, Omit<ModelPropsFromSchema<SkillBonusSchema>, "name" | "specialization" | "tags"> {
	name: StringCriteria
	specialization: StringCriteria
	tags: StringCriteria
}

export { SkillBonus }
