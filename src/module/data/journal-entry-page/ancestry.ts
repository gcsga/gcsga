import { SystemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { AncestryOptions, WeightedAncestryOption } from "./components/ancestry-options.ts"

class AncestryData extends SystemDataModel<JournalEntryPage<JournalEntry>, AncestrySchema> {
	static override defineSchema(): AncestrySchema {
		const fields = foundry.data.fields
		return {
			common_options: new fields.EmbeddedDataField(AncestryOptions),
			gender_options: new fields.ArrayField(new fields.EmbeddedDataField(WeightedAncestryOption)),
		}
	}
}

interface AncestryData extends ModelPropsFromSchema<AncestrySchema> {}

type AncestrySchema = {
	common_options: fields.EmbeddedDataField<AncestryOptions>
	gender_options: fields.ArrayField<fields.EmbeddedDataField<WeightedAncestryOption>>
}

export { AncestryData, type AncestrySchema }
