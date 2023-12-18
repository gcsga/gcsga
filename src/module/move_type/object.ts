import { VariableResolver, sanitizeId } from "@util"
import { MoveTypeObj } from "./data"
import { reserved_ids } from "@module/attribute"
import { MoveTypeDef } from "./move_type_def"

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
}

// TODO:
// definition should contain separate definition fields for normal move and enhanced move
// need to add interface on charsheet for diretly modifying point value of move types
// this will be added to third_party section of GCS file
// should also add a new feature type which modifies a move type, maybe be able to choose between normal or enhanced move
// or maybe two new feature types
// or maybe just a list of attributes whose level should be taken into account
// or maybe just add it to the definition by default so we don't have to screw around with new feature types and the like
