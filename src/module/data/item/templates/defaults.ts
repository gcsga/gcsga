import fields = foundry.data.fields
import { ItemDataModel } from "@module/data/abstract.ts"
import { SkillDefault } from "@module/data/skill-default.ts"

class SkillDefaultTemplate extends ItemDataModel<SkillDefaultTemplateSchema> {
	static override defineSchema(): SkillDefaultTemplateSchema {
		const fields = foundry.data.fields
		return {
			defaults: new fields.ArrayField(new fields.EmbeddedDataField(SkillDefault)),
		}
	}
}

interface SkillDefaultTemplate extends ModelPropsFromSchema<SkillDefaultTemplateSchema> {}

type SkillDefaultTemplateSchema = {
	defaults: fields.ArrayField<fields.EmbeddedDataField<SkillDefault>>
}

export { SkillDefaultTemplate, type SkillDefaultTemplateSchema }
