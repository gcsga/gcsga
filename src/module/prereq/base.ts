import { CharacterGURPS } from "@actor"
import { Prereq } from "@module/config"
import { NumericComparisonType, PrereqType, StringComparisonType } from "@module/data"
import { TooltipGURPS } from "@module/tooltip"

export interface PrereqConstructionContext {
	ready?: boolean
}

export class BasePrereq {
	type!: PrereqType

	has!: boolean

	constructor(data: Prereq | any, context: PrereqConstructionContext = {}) {
		if (context.ready) {
			Object.assign(this, data)
		} else {
			mergeObject(context, {
				ready: true,
			})
			const PrereqConstructor = CONFIG.GURPS.Prereq.classes[data?.type as PrereqType]
			if (PrereqConstructor) return new PrereqConstructor(data as any, context)
			throw new Error("No PrereqConstructor provided")
		}
	}

	static get defaults(): Record<string, any> {
		return {
			has: true,
		}
	}

	static get default() {
		return new BasePrereq(
			{
				type: PrereqType.Trait,
				name: { compare: StringComparisonType.IsString, qualifier: "" },
				notes: { compare: StringComparisonType.AnyString, qualifier: "" },
				levels: { compare: NumericComparisonType.AtLeastNumber, qualifier: 0 },
				has: true,
			},
			{ ready: true }
		)
	}

	static get list() {
		return new BasePrereq({
			type: PrereqType.List,
			all: true,
			when_tl: { compare: NumericComparisonType.AnyNumber, qualifier: 0 },
			prereqs: [],
		})
	}

	satisfied(character: CharacterGURPS, exclude: any, tooltip: TooltipGURPS): [boolean, boolean] {
		return [false, false]
	}
}
