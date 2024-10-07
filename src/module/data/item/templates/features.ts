import fields = foundry.data.fields
import { SystemDataModel } from "@module/data/abstract.ts"
import { Feature, FeatureTypes } from "@module/data/feature/types.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { ActiveEffectGURPS } from "@module/document/active-effect.ts"
import { feature } from "@util"

class FeatureTemplate extends SystemDataModel<ItemGURPS2 | ActiveEffectGURPS, FeatureTemplateSchema> {
	static override defineSchema(): FeatureTemplateSchema {
		const fields = foundry.data.fields
		return {
			features: new fields.ArrayField(new fields.TypedSchemaField(FeatureTypes)),
		}
	}
}

interface FeatureTemplate extends ModelPropsFromSchema<FeatureTemplateSchema> {
	features: Feature[]
}

type FeatureTemplateSchema = {
	features: fields.ArrayField<fields.TypedSchemaField<Record<feature.Type, ConstructorOf<Feature>>>>
}

export { FeatureTemplate, type FeatureTemplateSchema }
