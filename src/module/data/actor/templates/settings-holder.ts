import { ActorDataModel } from "@module/data/abstract.ts"
import { SheetSettings, SheetSettingsSchema } from "@system"
import fields = foundry.data.fields

class SettingsHolderTemplate extends ActorDataModel<SettingsHolderTemplateSchema> {
	static override defineSchema(): SettingsHolderTemplateSchema {
		const fields = foundry.data.fields

		return {
			settings: new fields.SchemaField(SheetSettings.defineSchema()),
		}
	}
}

interface SettingsHolderTemplate extends Omit<ModelPropsFromSchema<SettingsHolderTemplateSchema>, "settings"> {
	settings: SheetSettings
}

type SettingsHolderTemplateSchema = {
	settings: fields.SchemaField<SheetSettingsSchema>
}

export { SettingsHolderTemplate, type SettingsHolderTemplateSchema }
