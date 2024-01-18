import { WeaponDamage } from "@item"
import { WeaponDamageObj } from "@item/weapon/data"
import { Attribute, AttributeDefObj, AttributeObj } from "@module/attribute"
import { DiceGURPS } from "@module/dice"
import { MoveTypeDefObj } from "@module/move_type"
import { difficulty, progression, selfctrl } from "@util/enum"
import { StringBuilder } from "@util/string_builder"

export interface MookData {
	settings: {
		attributes: AttributeDefObj[]
		damage_progression: progression.Option
		move_types: MoveTypeDefObj[]
	}
	system: {
		attributes: AttributeObj[]
	}
	attributes: Map<string, Attribute>
	traits: MookTrait[]
	skills: MookSkill[]
	spells: MookSpell[]
	melee: MookMelee[]
	ranged: MookRanged[]
	equipment: MookEquipment[]
	other_equipment: MookEquipment[]
	notes: MookNote[]
	profile: MookProfile
	thrust: DiceGURPS
	swing: DiceGURPS
}

export interface MookProfile {
	name: string
	description: string
	title: string
	height: string
	weight: string
	SM: number
	portrait: string
	userdesc: string
}

// interface _MookItem {
// 	name: string
// 	notes: string
// 	reference: string
// 	// reference_highlight: string
// }
class _MookItem {
	name = ""

	notes = ""

	reference = ""

	constructor(data: any) {
		Object.assign(this, data)
	}
}

// export interface MookTrait extends _MookItem {
// 	points: number
// 	cr: selfctrl.Roll
// 	levels: number
// 	modifiers: MookTraitModifier[]
// }
export class MookTrait extends _MookItem {
	points = 0

	cr: selfctrl.Roll = selfctrl.Roll.NoCR

	levels = 0

	modifiers: MookTraitModifier[] = []

	toString(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		if (this.levels !== 0)
			buffer.push(` ${this.levels}`)
		if (this.points !== 0)
			buffer.push(` [${this.points}]`)
		if (this.cr !== selfctrl.Roll.NoCR)
			buffer.push(` (CR:${this.cr})`)
		if (this.modifiers.length !== 0) {
			const subBuffer = new StringBuilder()
			this.modifiers.forEach(mod => {
				if (subBuffer.length !== 0) subBuffer.push("; ")
				subBuffer.push(`${mod.name}, ${mod.cost}`)
			})
			buffer.push(` (${subBuffer.toString()})`)
		}
		return buffer.toString()
	}
}

// export interface MookTraitModifier extends _MookItem {
// 	cost: string
// }
export class MookTraitModifier extends _MookItem {
	cost = ""
}

// export interface MookSkill extends _MookItem {
// 	specialization: string
// 	tech_level: string
// 	difficulty: `${string}/${difficulty.Level}`
// 	points: number
// 	level: number
// }
export class MookSkill extends _MookItem {
	specialization = ""

	tech_level = ""

	difficulty: `${string}/${difficulty.Level}` = `dx/${difficulty.Level.Average}`

	points = 0

	level = 0

	toString(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		if (this.specialization !== "")
			buffer.push(` (${this.specialization})`)
		if (this.tech_level !== "")
			buffer.push(`/TL${this.tech_level}`)
		buffer.push(`-${this.level}`)
		buffer.push(` (${this.difficulty})`)
		return buffer.toString()
	}
}

export class MookSpell extends _MookItem {
	// specialization: string
	tech_level = ""

	difficulty: `${string}/${difficulty.Level}` = `iq/${difficulty.Level.Hard}`

	points = 0

	level = 0

	college: Array<string> = []

	toString(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		if (this.tech_level !== "")
			buffer.push(`/TL${this.tech_level}`)
		buffer.push(`-${this.level}`)
		buffer.push(` (${this.difficulty})`)
		return buffer.toString()
	}
}

export class MookWeapon extends _MookItem {
	strength = ""

	damage!: WeaponDamageObj

	level = 0
}

export class MookMelee extends MookWeapon {
	reach = ""

	parry = ""

	block = ""

	toString(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		buffer.push(` (${this.level}):`)
		buffer.push(` ${new WeaponDamage(this.damage as any).toString()}`)
		if (this.strength !== "")
			buffer.push(` ST:${this.strength}`)
		if (this.reach !== "")
			buffer.push(` Reach:${this.reach}`)
		if (this.parry !== "")
			buffer.push(` Parry:${this.parry}`)
		if (this.block !== "")
			buffer.push(` Block:${this.block}`)
		return buffer.toString()
	}
}

export class MookRanged extends MookWeapon {
	accuracy = ""

	range = ""

	rate_of_fire = ""

	shots = ""

	bulk = ""

	recoil = ""

	toString(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		buffer.push(` (${this.level}):`)
		buffer.push(` ${new WeaponDamage(this.damage as any).toString()}`)
		if (this.strength !== "")
			buffer.push(` ST:${this.strength}`)
		if (this.accuracy !== "")
			buffer.push(` Acc:${this.accuracy}`)
		if (this.range !== "")
			buffer.push(` Range:${this.range}`)
		if (this.rate_of_fire !== "")
			buffer.push(` ROF:${this.rate_of_fire}`)
		if (this.shots !== "")
			buffer.push(` Shots:${this.shots}`)
		if (this.bulk !== "")
			buffer.push(` Bulk:${this.bulk}`)
		if (this.recoil !== "")
			buffer.push(` Rcl:${this.recoil}`)
		return buffer.toString()
	}
}

export class MookEquipment extends _MookItem {
	quantity = 0

	tech_level = ""

	legality_class = ""

	value = 0

	weight = ""

	uses = 0

	max_uses = 0

	toStrign(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		return buffer.toString()
	}
}

export type MookNote = _MookItem
