import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { prereq } from "@util/enum/prereq.ts"
import { CharacterResolver, LootResolver } from "@util/resolvers.ts"

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
