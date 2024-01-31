import { ActorGURPS } from "@actor/base.ts"
import { StaticItemSystemData } from "./data.ts"
import { ItemType } from "@item/types.ts"

export interface StaticItemGURPS<TParent extends ActorGURPS | null> extends Item<TParent> {
	type: ItemType.LegacyEquipment
	system: StaticItemSystemData
}

export class StaticItemGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends Item<TParent> {
	async internalUpdate(data: Record<string, unknown>, context = {}): Promise<unknown> {
		let ctx = { render: true }
		if (context) ctx = { ...context, ...ctx }
		return this.update(data, ctx)
	}
}
