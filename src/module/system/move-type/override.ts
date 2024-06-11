import { MoveTypeOverrideConditionType, MoveTypeOverrideObj } from "./data.ts"
import { MoveTypeResolver, evaluateToNumber } from "@util"

export class MoveTypeOverride {
	condition: { type: MoveTypeOverrideConditionType; qualifier: string }

	move_type_base: string

	constructor(data: MoveTypeOverrideObj) {
		this.condition = data.condition
		this.move_type_base = data.move_type_base
	}

	conditionMet(resolver: MoveTypeResolver): boolean {
		switch (this.condition.type) {
			case MoveTypeOverrideConditionType.Skill:
				return resolver.skills.some(e => e.name === this.condition.qualifier)
			case MoveTypeOverrideConditionType.Trait:
				return resolver.traits.some(e => e.name === this.condition.qualifier)
			case MoveTypeOverrideConditionType.Condition:
				return resolver.conditions.some(e => e.system.id === this.condition.qualifier)
		}
	}

	baseValue(resolver: MoveTypeResolver): number {
		return evaluateToNumber(this.move_type_base, resolver)
	}
}
