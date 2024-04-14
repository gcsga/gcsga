import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSource,
} from "@item/abstract-container/data.ts"
import { ItemFlagsGURPS } from "@item/data/index.ts"
import { ItemFlags, ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { FeatureObj, PrereqListObj } from "@system"
import { WeightString } from "@util"

type EquipmentSource = AbstractContainerSource<ItemType.Equipment, EquipmentSystemSource> & {
	flags: DeepPartial<EquipmentFlags>
}

type EquipmentFlags = ItemFlagsGURPS & {
	[SYSTEM_NAME]: {
		[ItemFlags.Other]: boolean
	}
}

interface EquipmentSystemSource extends AbstractContainerSystemSource {
	type: ItemType.Equipment
	description: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tech_level: string
	legality_class: string
	tags: string[]
	rated_strength: number | null
	quantity: number
	value: number
	weight: WeightString
	max_uses: number
	uses: number
	prereqs: PrereqListObj
	features: FeatureObj[]
	equipped: boolean
	ignore_weight_for_skills: boolean
}

interface EquipmentSystemData extends EquipmentSystemSource, AbstractContainerSystemData {}

export type { EquipmentSource, EquipmentSystemData, EquipmentSystemSource, EquipmentFlags }
