import { VariableResolver, sanitizeId } from "@util"
import { MoveTypeObj } from "./data"
import { reserved_ids } from "@module/attribute"
import { MoveTypeDef } from "./move_type_def"
import { MoveBonusType } from "@feature"

export class MoveType {
	actor: VariableResolver

	order: number

	private move_type_id: string

	adj = 0

	constructor(actor: VariableResolver, move_type_id: string, order: number, data?: Partial<MoveTypeObj>) {
		if (data) Object.assign(this, data)
		this.actor = actor
		this.move_type_id = move_type_id
		this.order = order
	}

	get id(): string {
		return this.move_type_id
	}

	set id(v: string) {
		this.move_type_id = sanitizeId(v, false, reserved_ids)
	}

	get move_type_def(): MoveTypeDef {
		return new MoveTypeDef(this.actor.settings.move_types.find(e => e.id === this.move_type_id))
	}

	get bonus(): number {
		if (!this.actor) return 0
		return this.actor.moveBonusFor(this.id, MoveBonusType.Base)
	}

	get base(): number {
		const def = this.move_type_def
		if (!def) return 0
		return Math.floor(def.baseValue(this.actor) + this.adj + this.bonus)

	}

	get enhanced(): number {
		const def = this.move_type_def
		if (!def) return 0
		let enhanced = def.baseValue(this.actor)
		const bonus = this.actor.moveBonusFor(this.id, MoveBonusType.Enhanced)
		enhanced = enhanced << Math.floor(bonus)
		if (bonus % 1 >= 0.5) enhanced *= 1.5
		return enhanced
	}
}

// TODO:
// definition should contain separate definition fields for normal move and enhanced move
// need to add interface on charsheet for diretly modifying point value of move types
// this will be added to third_party section of GCS file
// should also add a new feature type which modifies a move type, maybe be able to choose between normal or enhanced move
// or maybe two new feature types
// or maybe just a list of attributes whose level should be taken into account
// or maybe just add it to the definition by default so we don't have to screw around with new feature types and the like
