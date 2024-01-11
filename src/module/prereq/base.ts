import { TooltipGURPS } from "@module/tooltip"
import { CharacterResolver, LootResolver } from "@util"
import { prereq } from "@util/enum"

export interface BasePrereqObj {
	type: prereq.Type
	has: boolean
}

export abstract class BasePrereq {
	type!: prereq.Type

	has = true

	constructor(type: prereq.Type) {
		this.type = type
	}

	abstract satisfied(
		character: CharacterResolver | LootResolver,
		exclude: any,
		tooltip: TooltipGURPS,
		...args: any[]
	): boolean
}
