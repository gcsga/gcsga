import { BaseItemGURPS } from "@item/base"
import { StaticItemSource } from "./data"

export class StaticItemGURPS extends BaseItemGURPS<StaticItemSource> {
	async internalUpdate(data: any, context = {}): Promise<unknown> {
		let ctx = { render: true }
		if (context) ctx = { ...context, ...ctx }
		return this.update(data, ctx)
	}
}
