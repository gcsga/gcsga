import { study } from "@util"
import fields = foundry.data.fields
import { ItemDataModel } from "@module/data/item/abstract.ts"
import { Study } from "@module/data/study.ts"
import { ToggleableStringField } from "@module/data/fields/toggleable-string-fields.ts"

class StudyTemplate extends ItemDataModel<StudyTemplateSchema> {
	static override defineSchema(): StudyTemplateSchema {
		const fields = foundry.data.fields
		return {
			...super.defineSchema(),
			study: new fields.ArrayField(new fields.EmbeddedDataField(Study)),
			study_hours_needed: new ToggleableStringField({
				required: true,
				nullable: false,
				blank: false,
				choices: study.LevelsChoices,
				initial: study.Level.Standard,
			}),
		}
	}

	get studyCurrent(): number {
		return Study.resolveHours(this)
	}

	get studyTotal(): number {
		return parseInt(this.study_hours_needed) ?? 0
	}
}

interface StudyTemplate extends ItemDataModel<StudyTemplateSchema>, ModelPropsFromSchema<StudyTemplateSchema> {}

type StudyTemplateSchema = {
	study: fields.ArrayField<fields.EmbeddedDataField<Study>>
	study_hours_needed: ToggleableStringField<study.Level, study.Level, true, false, true>
}

export { StudyTemplate, type StudyTemplateSchema }
