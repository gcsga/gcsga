import { CharacterResolver, sanitizeId } from "@util"
import { MoveTypeObj } from "./data.ts"
import { MoveBonusType } from "@feature"
import { MoveTypeDef } from "./move_type_def.ts"
import { reserved_ids } from "@sytem/attribute/data.ts"

export class MoveType {
	actor: CharacterResolver

	order: number

	private move_type_id: string

	adj = 0

	constructor(actor: CharacterResolver, move_type_id: string, order: number, data?: Partial<MoveTypeObj>) {
		if (data) Object.assign(this, data)
		this.actor = actor
		this.move_type_id = move_type_id
		this.order = order
	}

	get name(): string {
		return this.move_type_def.name
	}

	get id(): string {
		return this.move_type_id
	}

	set id(v: string) {
		this.move_type_id = sanitizeId(v, false, reserved_ids)
	}

	get move_type_def(): MoveTypeDef {
		return new MoveTypeDef(this.actor.settings.move_types.find(e => e.id === this.move_type_id)!)
	}

	get base(): number {
		const def = this.move_type_def
		const bonus = this.actor.moveBonusFor(this.id, MoveBonusType.Base)
		let base = def.baseValue(this.actor)
		if (!def) return 0
		for (const override of def.overrides) {
			if (override.conditionMet(this.actor)) base = override.baseValue(this.actor)
		}
		return Math.floor(base + this.adj + bonus)
	}

	get enhanced(): number {
		const def = this.move_type_def
		const bonus = this.actor.moveBonusFor(this.id, MoveBonusType.Enhanced)
		if (!def) return 0
		let enhanced = def.baseValue(this.actor)
		for (const override of def.overrides) {
			if (override.conditionMet(this.actor)) {
				enhanced = override.baseValue(this.actor)
			}
		}

		enhanced = enhanced << Math.floor(bonus)
		if (bonus % 1 >= 0.5) enhanced *= 1.5
		return enhanced
	}
}
