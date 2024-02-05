import {
	StaticEquipment,
	StaticMelee,
	StaticRanged,
	StaticSkill,
	StaticSpell,
	StaticTrait,
} from "@actor/static/components.ts"
import { ItemType } from "@data"
import { BaseItemSourceGURPS } from "@item/base/data/system.ts"

export type StaticItemSource = BaseItemSourceGURPS<ItemType.LegacyEquipment, StaticItemSystemData>

// Export class StaticItemData extends BaseItemDataGURPS<StaticItemGURPS> {}

export interface StaticItemData extends StaticItemSource, StaticItemSystemData {
	readonly type: StaticItemSource["type"]
	data: StaticItemSystemData

	readonly _source: StaticItemSource
}

export interface StaticItemSystemData {
	eqt: StaticEquipment
	// eqt: {
	// 	name: string
	// 	notes: string
	// 	pageref: string
	// 	count: number
	// 	weight: number
	// 	cost: number
	// 	location: string
	// 	carried: boolean
	// 	equipped: boolean
	// 	techlevel: string
	// 	categories: string
	// 	legalityclass: string
	// 	costsum: number
	// 	weightsum: number
	// 	uses: number
	// 	maxuses: number
	// 	parentuuid: string
	// 	uuid: string
	// 	itemid: string
	// 	gloablid: string
	// 	contains: any
	// 	img: string | null
	// }
	ads: { [key: string]: StaticTrait }
	skills: { [key: string]: StaticSkill }
	spells: { [key: string]: StaticSpell }
	eqtsummary: number
	melee: { [key: string]: StaticMelee }
	ranged: { [key: string]: StaticRanged }
	bonuses: string
	equipped: boolean
	carried: boolean
	globalid: string
	uuid: string
}
