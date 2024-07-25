import type { NumberField, SchemaField, StringField } from "types/foundry/common/data/fields.js"
import type { ActorGURPS } from "./document.ts"

abstract class ActorSystemModel<TParent extends ActorGURPS, TSchema extends ActorSystemSchema> extends foundry.abstract
	.TypeDataModel<TParent, TSchema> {
	static override defineSchema(): ActorSystemSchema {
		const fields = foundry.data.fields

		return {
			_migration: new fields.SchemaField({
				version: new fields.NumberField({
					required: true,
					nullable: true,
					positive: true,
					initial: null,
				}),
				previous: new fields.SchemaField(
					{
						foundry: new fields.StringField({ required: true, nullable: true, initial: null }),
						system: new fields.StringField({ required: true, nullable: true, initial: null }),
						schema: new fields.NumberField({
							required: true,
							nullable: true,
							positive: true,
							initial: null,
						}),
					},
					{ required: true, nullable: true, initial: null },
				),
			}),
		}
	}
}

interface ActorSystemModel<TParent extends ActorGURPS, TSchema extends ActorSystemSchema>
	extends foundry.abstract.TypeDataModel<TParent, TSchema> {}

type ActorSystemSchema = {
	_migration: SchemaField<{
		version: NumberField<number, number, true, true, true>
		previous: SchemaField<
			{
				foundry: StringField<string, string, true, true, true>
				system: StringField<string, string, true, true, true>
				schema: NumberField<number, number, true, true, true>
			},
			{ foundry: string | null; system: string | null; schema: number | null },
			{ foundry: string | null; system: string | null; schema: number | null },
			true,
			true,
			true
		>
	}>
}

export { ActorSystemModel, type ActorSystemSchema }
