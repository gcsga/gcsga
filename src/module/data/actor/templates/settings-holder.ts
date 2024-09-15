import { ActorDataModel } from "@module/data/abstract.ts"
import fields = foundry.data.fields
import { CharacterSheetSettingsSchema, SheetSettings } from "@module/data/sheet-settings.ts"

class SettingsHolderTemplate extends ActorDataModel<SettingsHolderTemplateSchema> {
	static override defineSchema(): SettingsHolderTemplateSchema {
		const fields = foundry.data.fields

		return {
			settings: new fields.SchemaField(SheetSettings.defineSchema()),
		}
	}
}

interface SettingsHolderTemplate extends ModelPropsFromSchema<SettingsHolderTemplateSchema> {}

type SettingsHolderTemplateSchema = {
	settings: fields.SchemaField<
		CharacterSheetSettingsSchema,
		SourceFromSchema<CharacterSheetSettingsSchema>,
		SheetSettings
	>
}

export { SettingsHolderTemplate, type SettingsHolderTemplateSchema }
