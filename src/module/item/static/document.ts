import { ActorGURPS } from "@actor/base.ts"
import { StaticItemSystemData } from "./data.ts"
import { ItemType } from "@module/data/index.ts"

export interface StaticItemGuRPS<TParent extends ActorGURPS | null> extends Item<TParent> {
	type: ItemType.LegacyEquipment
	system: StaticItemSystemData
}

export class StaticItemGuRPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends Item<TParent> {
	async internalUpdate(data: any, context = {}): Promise<unknown> {
		let ctx = { render: true }
		if (context) ctx = { ...context, ...ctx }
		return this.update(data, ctx)
	}
}
