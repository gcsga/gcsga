import { study } from "@util"
import fields = foundry.data.fields
import { ItemDataModel } from "@module/data/abstract.ts"
import { Study, StudySchema } from "@module/data/study.ts"

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

interface StudyTemplate extends ItemDataModel<StudyTemplateSchema>, ModelPropsFromSchema<StudyTemplateSchema> {}

type StudyTemplateSchema = {
	study: fields.ArrayField<fields.SchemaField<StudySchema, SourceFromSchema<StudySchema>, Study>>
	study_hours_needed: fields.StringField<study.Level>
}

export { StudyTemplate, type StudyTemplateSchema }
