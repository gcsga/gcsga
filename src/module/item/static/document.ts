import { BaseItemGURPS } from "@item/base"
import { StaticItemData } from "./data"

export class StaticItemGURPS extends BaseItemGURPS {
	readonly system!: StaticItemData

	async internalUpdate(data: any, context = {}): Promise<unknown> {
		let ctx = { render: true }
		if (context) ctx = { ...context, ...ctx }
		return this.update(data, ctx)
	}
}
