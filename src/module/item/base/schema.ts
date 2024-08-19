import type { ItemGURPS } from "./document.ts"
import { SlugField } from "@system/schema-data-fields.ts"
import { TID, TIDString } from "@module/util/tid.ts"
import fields = foundry.data.fields

abstract class ItemSystemModel<
	TParent extends ItemGURPS = ItemGURPS,
	TSchema extends ItemSystemSchema = ItemSystemSchema,
> extends foundry.abstract.TypeDataModel<TParent, TSchema> {
	static override defineSchema(): ItemSystemSchema {
		const fields = foundry.data.fields

		return {
			container: new fields.ForeignDocumentField(foundry.documents.BaseItem, {
				required: true,
				nullable: true,
				idOnly: true,
			}),
			id: new fields.StringField({ required: true, nullable: false, validate: TID.isValidAndItem }),
			slug: new SlugField({ required: true, nullable: true, initial: null }),
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

interface ItemSystemModel<TParent extends ItemGURPS, TSchema extends ItemSystemSchema>
	extends foundry.abstract.TypeDataModel<TParent, TSchema> {}

type ItemSystemSchema = {
	container: fields.ForeignDocumentField<string, true, true, true>
	id: fields.StringField<TIDString, TIDString, true, false, true>
	slug: SlugField<true, true, true>
	_migration: fields.SchemaField<{
		version: fields.NumberField<number, number, true, true, true>
		previous: fields.SchemaField<
			{
				foundry: fields.StringField<string, string, true, true, true>
				system: fields.StringField<string, string, true, true, true>
				schema: fields.NumberField<number, number, true, true, true>
			},
			{ foundry: string | null; system: string | null; schema: number | null },
			{ foundry: string | null; system: string | null; schema: number | null },
			true,
			true,
			true
		>
	}>
}

export { ItemSystemModel, type ItemSystemSchema }
