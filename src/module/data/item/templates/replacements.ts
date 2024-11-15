import { ItemDataModel, ItemDatabaseUpdateOperation } from "@module/data/item/abstract.ts"
import fields = foundry.data.fields
import { Nameable } from "@module/util/nameable.ts"
import { RecordField } from "@module/data/fields/record-field.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"

class ReplacementTemplate extends ItemDataModel<ReplacementTemplateSchema> {
	static override defineSchema(): ReplacementTemplateSchema {
		const fields = foundry.data.fields
		return {
			replacements: new RecordField(
				new fields.StringField({ required: true, nullable: false }),
				new fields.StringField({ required: true, nullable: true }),
			),
		}
	}

	override _onUpdate(
		changed: Partial<this["_source"]>,
		options: ItemDatabaseUpdateOperation<ItemGURPS2["parent"]>,
		userId: string,
	) {
		super._onUpdate(changed, options, userId)
	}

	/** The replacements to be used with nameables */
	get nameableReplacements(): Map<string, string> {
		return new Map(Object.entries(this.replacements) as [string, string][])
	}

	override prepareBaseData(): void {
		super.prepareBaseData()
		this.prepareNameableKeys()
	}

	/** This function is public so that it can be called from other items,
	 * i.e. when weapon data updates should trigger
	 * nameable key updates in their containers
	 */
	prepareNameableKeys(): void {
		const replacements = new Map<string, string | null>()
		this.fillWithNameableKeys(replacements, this.nameableReplacements)
		for (const key of this.nameableReplacements.keys()) {
			// if (!replacements.has(key)) replacements.set(`-=${key}`, null)
			if (!replacements.has(key)) replacements.delete(key)
		}
		this.replacements = Object.fromEntries(replacements.entries())
	}

	fillWithNameableKeys(
		m: Map<string, string | null>,
		existing: Map<string, string> = this.nameableReplacements,
	): void {
		Nameable.extract(this.parent.name, m, existing)
	}
}

interface ReplacementTemplate
	extends ItemDataModel<ReplacementTemplateSchema>,
		ModelPropsFromSchema<ReplacementTemplateSchema> {}

type ReplacementTemplateSchema = {
	replacements: RecordField<
		fields.StringField<string, string, true, false, false>,
		fields.StringField<string, string, true, true, false>
	>
}

export { ReplacementTemplate, type ReplacementTemplateSchema }
