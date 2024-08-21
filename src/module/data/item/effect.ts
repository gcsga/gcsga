import { ItemDataModel } from "../abstract.ts"
import { AbstractEffectTemplate, AbstractEffectTemplateSchema } from "./templates/abstract-effect.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"

class EffectData extends ItemDataModel.mixin(BasicInformationTemplate, FeatureTemplate, AbstractEffectTemplate) {
	static override defineSchema(): EffectSchema {
		return this.mergeSchema(super.defineSchema(), {}) as EffectSchema
	}
}

interface EffectData extends ModelPropsFromSchema<EffectSchema> {}

type EffectSchema = BasicInformationTemplateSchema & FeatureTemplateSchema & AbstractEffectTemplateSchema & {}

export { EffectData, type EffectSchema }
