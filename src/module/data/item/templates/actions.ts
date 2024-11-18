import fields = foundry.data.fields
import { Feature, FeatureTypes } from "@module/data/feature/types.ts"
import { feature } from "@util"
import { ItemDataModel } from "../abstract.ts"

class ActionTemplate extends ItemDataModel<ActionTemplateSchema> {
	static override defineSchema(): ActionTemplateSchema {
		const fields = foundry.data.fields
		return {
			actions: new fields.ArrayField(new fields.TypedSchemaField(FeatureTypes)),
		}
	}
}

interface ActionTemplate extends ModelPropsFromSchema<ActionTemplateSchema> {
	features: Feature[]
}

type ActionTemplateSchema = {
	actions: fields.ArrayField<fields.TypedSchemaField<Record<feature.Type, ConstructorOf<Feature>>>>
}

export { ActionTemplate, type ActionTemplateSchema }
