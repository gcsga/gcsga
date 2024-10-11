import fields = foundry.data.fields
import { ItemDataModel } from "@module/data/item/abstract.ts"
import { SkillDefaultField } from "../fields/skill-default-field.ts"

class SkillDefaultTemplate extends ItemDataModel<SkillDefaultTemplateSchema> {
	static override defineSchema(): SkillDefaultTemplateSchema {
		const fields = foundry.data.fields
		return {
			defaults: new fields.ArrayField(new SkillDefaultField()),
		}
	}
}

interface SkillDefaultTemplate extends ModelPropsFromSchema<SkillDefaultTemplateSchema> {}

type SkillDefaultTemplateSchema = {
	defaults: fields.ArrayField<SkillDefaultField>
}

export { SkillDefaultTemplate, type SkillDefaultTemplateSchema }
