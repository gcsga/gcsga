import { MoveTypeResolver } from "@util"
import { MoveTypeObj } from "./data.ts"
import { MoveTypeDef } from "./definition.ts"
import { AbstractAttribute, MoveBonusType } from "@system"

export class MoveType<TActor extends MoveTypeResolver> extends AbstractAttribute<TActor> {
	adj = 0
	order: number

	constructor(actor: TActor, data: MoveTypeObj, order: number) {
		super(actor, data)
		this.adj = data.adj
		this.order = order
	}

	override get definition(): MoveTypeDef | null {
		return this.actor.settings.move_types.find(att => att.id === this.id) ?? null
	}

	bonus(type: MoveBonusType): number {
		if (!this.actor) return 0
		return this.actor.moveBonusFor(this.id, type)
	}

	// Base Move corresponding to this move type
	get base(): number {
		const def = this.definition
		if (!def) return 0
		let base = def.baseValue(this.actor)
		if (!def) return 0
		for (const override of def.overrides) {
			if (override.conditionMet(this.actor)) base = override.baseValue(this.actor)
		}
		return Math.floor(base + this.adj + this.bonus(MoveBonusType.Base))
	}

	// Enhanced Move corresponding to this move type
	get enhanced(): number {
		const def = this.definition
		if (!def) return 0
		let enhanced = def.baseValue(this.actor)
		for (const override of def.overrides) {
			if (override.conditionMet(this.actor)) {
				enhanced = override.baseValue(this.actor)
			}
		}

		enhanced = enhanced << Math.floor(this.bonus(MoveBonusType.Enhanced))
		if (this.bonus(MoveBonusType.Enhanced) % 1 >= 0.5) enhanced *= 1.5
		return enhanced
	}
}
