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

	/** Namebales */
	protected _fillWithNameableKeysFromDefaults(m: Map<string, string>, existing: Map<string, string>): void {
		for (const feature of this.defaults) {
			feature.fillWithNameableKeys(m, existing)
		}
	}
}

interface SkillDefaultTemplate extends ModelPropsFromSchema<SkillDefaultTemplateSchema> {}

type SkillDefaultTemplateSchema = {
	defaults: fields.ArrayField<SkillDefaultField>
}

export { SkillDefaultTemplate, type SkillDefaultTemplateSchema }
