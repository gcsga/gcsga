import { PrereqResolver, TooltipGURPS } from "@util"
import { prereq } from "@util/enum/prereq.ts"

export abstract class BasePrereq {
	type!: prereq.Type

	has = true

	constructor(type: prereq.Type) {
		this.type = type
	}

	abstract satisfied(character: PrereqResolver, exclude: unknown, tooltip: TooltipGURPS, ...args: unknown[]): boolean
}
