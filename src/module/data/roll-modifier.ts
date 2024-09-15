import { RollType } from "@module/data/constants.ts"
import fields = foundry.data.fields
class RollModifier extends foundry.abstract.DataModel<foundry.abstract.Document, RollModifierSchema> {
	static override defineSchema(): RollModifierSchema {
		const fields = foundry.data.fields
		return {
			id: new fields.StringField({ required: true, nullable: false, initial: "" }),
			modifier: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			rollType: new fields.StringField<RollType, RollType, true, true, true>({
				required: true,
				nullable: true,
				initial: null,
			}),
			tags: new fields.ArrayField(new fields.StringField({ required: true, nullable: false })),
			cost: new fields.SchemaField({
				id: new fields.StringField({ required: true, nullable: false, initial: "" }),
				value: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			}),
			reference: new fields.StringField({ required: true, nullable: true, initial: null }),
			target: new fields.BooleanField({ required: true, nullable: true, initial: null }),
		}
	}
}

interface RollModifier
	extends foundry.abstract.DataModel<foundry.abstract.Document, RollModifierSchema>,
		ModelPropsFromSchema<RollModifierSchema> {}

type RollModifierSchema = {
	// The name attached to the modifier
	id: fields.StringField<string, string, true, false, true>
	// The value of the modifier itself
	modifier: fields.NumberField<number, number, true, false, true>
	// The type of roll it is attached to. TODO: is this needed?
	rollType: fields.StringField<RollType, RollType, true, true, true>
	// A set of tags for categorisation of the modifier
	tags: fields.ArrayField<fields.StringField<string, string, true, false, true>>
	// A pool attribute cost associated with the modifier
	cost: fields.SchemaField<{
		id: fields.StringField<string, string, true, false, true>
		value: fields.NumberField<number, number, true, false, true>
	}>
	// A book reference for the modifier
	reference: fields.StringField<string, string, true, true, true>
	// TODO: what is this? is it needed?
	target: fields.BooleanField<boolean, boolean, true, true, true>
}

class RollModifierStack extends foundry.abstract.DataModel<foundry.abstract.Document, RollModifierStackSchema> {
	static override defineSchema(): RollModifierStackSchema {
		const fields = foundry.data.fields
		return {
			title: new fields.StringField({ required: true, nullable: false, initial: "" }),
			items: new fields.ArrayField(new fields.SchemaField(RollModifier.defineSchema())),
			editing: new fields.BooleanField({ required: true, nullable: true, initial: null }),
			open: new fields.BooleanField({ required: true, nullable: true, initial: null }),
		}
	}
}

interface RollModifierStack
	extends foundry.abstract.DataModel<foundry.abstract.Document, RollModifierStackSchema>,
		ModelPropsFromSchema<RollModifierStackSchema> {}

type RollModifierStackSchema = {
	title: fields.StringField<string, string, true, false, true>
	items: fields.ArrayField<fields.SchemaField<RollModifierSchema>>
	editing: fields.BooleanField<boolean, boolean, true, true, true>
	open: fields.BooleanField<boolean, boolean, true, true, true>
}

export { RollModifier, RollModifierStack, type RollModifierSchema, type RollModifierStackSchema }
