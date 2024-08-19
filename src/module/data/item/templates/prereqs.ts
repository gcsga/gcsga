import fields = foundry.data.fields
import { SystemDataModel } from "@module/data/abstract.ts"
import { NumericCompareType } from "@module/data/constants.ts"
import { BasePrereq, Prereq } from "@system"
import { prereq } from "@util"

class PrereqTemplate extends SystemDataModel<foundry.abstract.Document, PrereqTemplateSchema> {
	static override defineSchema(): PrereqTemplateSchema {
		const fields = foundry.data.fields
		return {
			prereqs: new fields.ArrayField(new fields.TypedSchemaField(BasePrereq.TYPES), {
				initial: [
					{
						type: prereq.Type.List,
						id: "root",
						all: true,
						when_tl: { compare: NumericCompareType.AnyNumber, qualifier: 0 },
						prereqs: [],
					},
				],
			}),
		}
	}
}

interface PrereqTemplate
	extends SystemDataModel<foundry.abstract.Document, PrereqTemplateSchema>,
		ModelPropsFromSchema<PrereqTemplateSchema> {}

type PrereqTemplateSchema = {
	prereqs: fields.ArrayField<fields.TypedSchemaField<Record<prereq.Type, ConstructorOf<Prereq>>>>
}

export { PrereqTemplate, type PrereqTemplateSchema }
