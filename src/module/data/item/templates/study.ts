import { study } from "@util"
import fields = foundry.data.fields
import { ItemDataModel, ItemDataSchema } from "@module/data/abstract.ts"
import { Study, StudySchema } from "@system"

class StudyTemplate extends ItemDataModel<StudyTemplateSchema> {
	static override defineSchema(): StudyTemplateSchema {
		const fields = foundry.data.fields
		return {
			...super.defineSchema(),
			study: new fields.ArrayField(new fields.SchemaField(Study.defineSchema())),
			study_hours_needed: new fields.StringField<study.Level>({
				choices: study.Levels,
				initial: study.Level.Standard,
			}),
		}
	}
}

interface StudyTemplate
	extends ItemDataModel<StudyTemplateSchema>,
		Omit<ModelPropsFromSchema<StudyTemplateSchema>, "study"> {
	study: Study[]
}

type StudyTemplateSchema = ItemDataSchema & {
	study: fields.ArrayField<fields.SchemaField<StudySchema>>
	study_hours_needed: fields.StringField<study.Level>
}

export { StudyTemplate, type StudyTemplateSchema }
