import { ActorDataModel } from "@module/data/actor/abstract.ts"
import fields = foundry.data.fields
import { SheetSettings } from "@module/data/sheet-settings.ts"

class SettingsHolderTemplate extends ActorDataModel<SettingsHolderTemplateSchema> {
	static override defineSchema(): SettingsHolderTemplateSchema {
		const fields = foundry.data.fields

		return {
			settings: new fields.EmbeddedDataField(SheetSettings),
		}
	}
}

interface SettingsHolderTemplate extends ModelPropsFromSchema<SettingsHolderTemplateSchema> {}

type SettingsHolderTemplateSchema = {
	settings: fields.EmbeddedDataField<SheetSettings, true, false, true>
}

export { SettingsHolderTemplate, type SettingsHolderTemplateSchema }
