import { ActorFlagsGURPS, ActorSystemData, BaseActorSourceGURPS } from "@actor/base"
import { ActorType } from "@module/data"
import { WeightUnits } from "@util"
import { display } from "@util/enum"

export interface LootSource extends BaseActorSourceGURPS<ActorType.Loot, LootSystemData> {
	flags: DeepPartial<LootFlags>
}
export interface LootDataGURPS extends Omit<LootSource, "effects" | "flags" | "items" | "token">, LootSystemData {
	readonly type: LootSource["type"]
	data: LootSystemData
	flags: LootFlags

	readonly _source: LootSource
}

export type LootFlags = ActorFlagsGURPS

export interface LootSystemData extends ActorSystemData {
	description: string
	import: { name: string; path: string; last_import: string }
	settings: LootSettings
	created_date: string
	modified_date: string
}

export interface LootSettings {
	default_weight_units: WeightUnits
	user_description_display: display.Option
	modifiers_display: display.Option
	notes_display: display.Option
	show_equipment_modifier_adj: boolean
}
