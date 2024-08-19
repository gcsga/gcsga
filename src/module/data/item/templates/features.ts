import fields = foundry.data.fields
import { SystemDataModel } from "@module/data/abstract.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { Feature } from "@system"
import { BaseFeature } from "@system/feature/base.ts"
import { feature } from "@util"

class FeatureTemplate extends SystemDataModel<ItemGURPS2, FeatureTemplateSchema> {
	static override defineSchema(): FeatureTemplateSchema {
		const fields = foundry.data.fields
		return {
			features: new fields.ArrayField(new fields.TypedSchemaField(BaseFeature.TYPES)),
		}
	}
}

interface FeatureTemplate
	extends SystemDataModel<ItemGURPS2, FeatureTemplateSchema>,
		ModelPropsFromSchema<FeatureTemplateSchema> {}

type FeatureTemplateSchema = {
	features: fields.ArrayField<fields.TypedSchemaField<Record<feature.Type, ConstructorOf<Feature>>>>
}

export { FeatureTemplate, type FeatureTemplateSchema }
