import fields = foundry.data.fields
import { ItemDataModel } from "@module/data/abstract.ts"
import { Feature, FeatureTypes } from "@module/data/feature/types.ts"
import { feature } from "@util"

class FeatureTemplate extends ItemDataModel<FeatureTemplateSchema> {
	static override defineSchema(): FeatureTemplateSchema {
		const fields = foundry.data.fields
		return {
			features: new fields.ArrayField(new fields.TypedSchemaField(FeatureTypes)),
		}
	}
}

interface FeatureTemplate extends ModelPropsFromSchema<FeatureTemplateSchema> {}

type FeatureTemplateSchema = {
	features: fields.ArrayField<fields.TypedSchemaField<Record<feature.Type, ConstructorOf<Feature>>>>
}

export { FeatureTemplate, type FeatureTemplateSchema }
