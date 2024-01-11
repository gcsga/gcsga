import { TooltipGURPS } from "@module/tooltip"
import { CharacterResolver } from "@util"
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

	// constructor(data: Prereq | any, context: PrereqConstructionContext = {}) {
	// 	if (context.ready) {
	// 		Object.assign(this, data)
	// 	} else {
	// 		mergeObject(context, {
	// 			ready: true,
	// 		})
	// 		const PrereqConstructor = CONFIG.GURPS.Prereq.classes[data?.type as PrereqType]
	// 		if (PrereqConstructor) return new PrereqConstructor(data as any, context)
	// 		throw new Error("No PrereqConstructor provided")
	// 	}
	// }

	// static get defaults(): Record<string, any> {
	// 	return {
	// 		has: true,
	// 	}
	// }

	// static get default() {
	// 	return new BasePrereq(
	// 		{
	// 			type: PrereqType.Trait,
	// 			name: { compare: StringCompareType.IsString, qualifier: "" },
	// 			notes: { compare: StringCompareType.AnyString, qualifier: "" },
	// 			levels: { compare: NumericComparisonType.AtLeastNumber, qualifier: 0 },
	// 			has: true,
	// 		},
	// 		{ ready: true }
	// 	)
	// }

	// static get list() {
	// 	return new BasePrereq({
	// 		type: PrereqType.List,
	// 		all: true,
	// 		when_tl: { compare: NumericComparisonType.AnyNumber, qualifier: 0 },
	// 		prereqs: [],
	// 	})
	// }

	abstract satisfied(character: CharacterResolver, exclude: any, tooltip: TooltipGURPS): boolean
}
