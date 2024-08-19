import { study } from "@util"
import fields = foundry.data.fields
import { SystemDataModel } from "@module/data/abstract.ts"
import { Study, StudySchema } from "@system"

class StudyTemplate extends SystemDataModel<foundry.abstract.Document, StudyTemplateSchema> {
	static override defineSchema(): StudyTemplateSchema {
		const fields = foundry.data.fields
		return {
			study: new fields.ArrayField(new fields.SchemaField(Study.defineSchema())),
			study_hours_needed: new fields.StringField<study.Level>({
				choices: study.Levels,
				initial: study.Level.Standard,
			}),
		}
	}
}

interface StudyTemplate
	extends SystemDataModel<foundry.abstract.Document, StudyTemplateSchema>,
		ModelPropsFromSchema<StudyTemplateSchema> {}

type StudyTemplateSchema = {
	study: fields.ArrayField<fields.SchemaField<StudySchema>>
	study_hours_needed: fields.StringField<study.Level>
}

export { StudyTemplate, type StudyTemplateSchema }
