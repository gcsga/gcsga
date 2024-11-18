import fields = foundry.data.fields
import { PseudoDocument, PseudoDocumentMetaData, PseudoDocumentSchema } from "../pseudo-document.ts"
import { ItemDataModel } from "../item/abstract.ts"
import { AppliedEffectField } from "./fields/applied-effect-field.ts"
import { ActionType } from "../constants.ts"
import { ActionInstances } from "./types.ts"
import { ErrorGURPS } from "@util"
import { CellDataOptions, CellData } from "../item/components/cell-data.ts"
import { SheetButton } from "../item/components/sheet-button.ts"

type ActionMetadata = PseudoDocumentMetaData

abstract class BaseAction<TSchema extends BaseActionSchema = BaseActionSchema> extends PseudoDocument<
	ItemDataModel,
	TSchema
> {
	static override metadata: ActionMetadata

	static override defineSchema(): BaseActionSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			activation: new fields.SchemaField({}),
			consumption: new fields.SchemaField({}),
			target: new fields.SchemaField({}),
			actionRange: new fields.SchemaField({}),
			effects: new fields.ArrayField(new AppliedEffectField()),
		}
	}

	/* -------------------------------------------- */

	cellData(_options: CellDataOptions = {}): Record<string, CellData> {
		throw ErrorGURPS(`Action#cellData must be implemented.`)
	}

	/* -------------------------------------------- */

	/**
	 * Type safe way of verifying if an Item is of a particular type.
	 */
	isOfType<T extends ActionType>(...types: T[]): this is ActionInstances[T] {
		return types.some(t => this.type === t)
	}

	/* -------------------------------------------- */

	get sheetButtons(): SheetButton[] {
		return [
			new SheetButton(
				{
					classList: ["fa-solid", "fa-ellipsis-vertical"],
					dataset: { contextMenu: "" },
					permission: foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
				},
				{ parent: this.parent },
			),
		]
	}
}

type BaseActionSchema = PseudoDocumentSchema & {
	activation: fields.SchemaField<{}> // TODO
	consumption: fields.SchemaField<{}> // TODO
	target: fields.SchemaField<{}> // TODO
	actionRange: fields.SchemaField<{}> // TODO
	effects: fields.ArrayField<AppliedEffectField> // TODO
}

export { BaseAction, type BaseActionSchema, type ActionMetadata }
