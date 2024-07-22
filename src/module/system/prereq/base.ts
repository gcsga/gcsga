import { TooltipGURPS } from "@util"
import { prereq } from "@util/enum/prereq.ts"
import { BasePrereqSchema, PrereqConstructionOptions } from "./data.ts"
import type { ItemGURPS } from "@item"
import { LaxSchemaField } from "@system/schema-data-fields.ts"
import type { ActorGURPS } from "@actor"

abstract class BasePrereq<
	TSchema extends BasePrereqSchema<prereq.Type> = BasePrereqSchema<prereq.Type>
> extends foundry.abstract.DataModel<ItemGURPS, TSchema> {

	protected declare static _schema: LaxSchemaField<BasePrereqSchema<prereq.Type>> | undefined

	static override defineSchema(): BasePrereqSchema<prereq.Type> {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({ initial: prereq.Type.Attribute })
		}
	}

	static override get schema(): LaxSchemaField<BasePrereqSchema<prereq.Type>> {
		if (this._schema && Object.hasOwn(this, "_schema")) return this._schema

		const schema = new LaxSchemaField(Object.freeze(this.defineSchema()))
		schema.name = this.name
		Object.defineProperty(this, "_schema", { value: schema, writable: false })

		return schema
	}

	constructor(
		data: DeepPartial<SourceFromSchema<TSchema>>,
		options?: PrereqConstructionOptions
	) {
		super(data, options)
	}

	abstract satisfied(actor: ActorGURPS, exclude: unknown, tooltip: TooltipGURPS, ...args: unknown[]): boolean
}

export { BasePrereq }
