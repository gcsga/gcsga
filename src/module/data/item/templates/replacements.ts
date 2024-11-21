import { ItemDataModel, ItemDatabaseUpdateOperation } from "@module/data/item/abstract.ts"
import { Nameable } from "@module/util/nameable.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { ReplacementsField } from "../fields/replacements-field.ts"

class ReplacementTemplate extends ItemDataModel<ReplacementTemplateSchema> {
	static override defineSchema(): ReplacementTemplateSchema {
		return {
			replacements: new ReplacementsField(),
		}
	}

	override _onUpdate(
		changed: Partial<this["_source"]>,
		options: ItemDatabaseUpdateOperation<ItemGURPS2["parent"]>,
		userId: string,
	) {
		super._onUpdate(changed, options, userId)
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
		const replacements = new Map<string, string>()
		this.fillWithNameableKeys(replacements, this.replacements)
		for (const key of this.replacements.keys()) {
			if (!replacements.has(key)) replacements.delete(key)
		}
		this.replacements = new Map(replacements.entries())
	}

	fillWithNameableKeys(m: Map<string, string | null>, existing: Map<string, string> = this.replacements): void {
		Nameable.extract(this.parent.name, m, existing)
	}
}

interface ReplacementTemplate
	extends ItemDataModel<ReplacementTemplateSchema>,
		ModelPropsFromSchema<ReplacementTemplateSchema> {}

type ReplacementTemplateSchema = {
	replacements: ReplacementsField<true, false, true>
}

export { ReplacementTemplate, type ReplacementTemplateSchema }
