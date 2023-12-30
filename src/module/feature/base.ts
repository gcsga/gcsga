// import { Feature } from "@module/config"
// import { ItemType } from "@module/data"
// import { TooltipGURPS } from "@module/tooltip"
// import { LeveledAmount } from "@util/leveled_amount"
// import { FeatureType } from "./data"

import { BonusOwner } from "./bonus_owner"
import { FeatureType } from "./data"
import { LeveledAmount } from "./leveled_amount"

// export interface FeatureConstructionContext {
// 	ready?: boolean
// }

// export class BaseFeature {
// 	type: FeatureType

// 	item?: Item

// 	amount!: number

// 	per_level!: boolean

// 	_levels!: number

// 	effective?: boolean

// 	constructor(data: Feature | any, context: FeatureConstructionContext = {}) {
// 		this.type = data.type // Needed?
// 		if (context?.ready) {
// 			Object.assign(this, data)
// 		} else {
// 			mergeObject(context, { ready: true })
// 			const FeatureConstructor = CONFIG.GURPS.Feature.classes[data.type as FeatureType]
// 			if (FeatureConstructor) {
// 				data = mergeObject(FeatureConstructor.defaults, data)
// 				return new FeatureConstructor(data, context)
// 			}
// 			return new BaseFeature(data, context)
// 		}
// 	}

// 	static get defaults(): Record<string, any> {
// 		return {
// 			amount: 1,
// 			per_level: false,
// 			levels: 0,
// 			effective: false,
// 		}
// 	}

// 	get adjustedAmount(): number {
// 		return this.amount * (this.per_level ? this.levels || 0 : 1)
// 	}

// 	get levels(): number {
// 		if (this.item) {
// 			if (this.item.type === ItemType.Trait) return (this.item as any).levels
// 			if (this.item.type === ItemType.Condition) return (this.item as any).level
// 			if (this.item.type === ItemType.Effect) return (this.item as any).level
// 			return 1
// 		}
// 		return this._levels
// 	}

// 	set levels(levels: number) {
// 		this._levels = levels
// 	}

// 	addToTooltip(buffer: TooltipGURPS | null): void {
// 		if (buffer) {
// 			buffer.push("\n")
// 			buffer.push(this.item?.name || "")
// 			buffer.push(
// 				` [${new LeveledAmount({
// 					level: this.levels,
// 					amount: this.amount,
// 					per_level: this.per_level,
// 				}).formatWithLevel(false)}]`
// 			)
// 		}
// 	}
// }
