import { ActorFlagsGURPS, ActorSystemSource, BaseActorSourceGURPS } from "@actor/index.ts"
import { ActorType } from "@module/data/index.ts"
import { display } from "@util/enum/display.ts"
import { WeightUnits } from "@util/weight.ts"

export interface LootSource extends BaseActorSourceGURPS<ActorType.Loot, LootSystemSource> {
	flags: DeepPartial<LootFlags>
}
export type LootFlags = ActorFlagsGURPS

export interface LootSystemSource extends ActorSystemSource {
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
