import { PrereqResolver, TooltipGURPS } from "@util"
import { prereq } from "@util/enum/prereq.ts"
import { BasePrereqObj } from "./data.ts"

export abstract class BasePrereq<TType extends prereq.Type = prereq.Type> {
	declare type: TType

	has = true

	constructor(type: TType) {
		this.type = type
	}

	abstract satisfied(character: PrereqResolver, exclude: unknown, tooltip: TooltipGURPS, ...args: unknown[]): boolean

	toObject(): BasePrereqObj<TType> {
		return {
			type: this.type,
		}
	}
}
