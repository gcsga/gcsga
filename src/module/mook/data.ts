import { WeaponDamageObj } from "@item/weapon/data"
import { Attribute, AttributeDefObj, AttributeObj } from "@module/attribute"
import { DamageProgression } from "@module/data"
import { DiceGURPS } from "@module/dice"
import { MoveTypeDefObj } from "@module/move_type"
import { difficulty } from "@util/enum"

export interface MookData {
	settings: {
		attributes: AttributeDefObj[]
		damage_progression: DamageProgression
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

interface _MookItem {
	name: string
	notes: string
	reference: string
	// reference_highlight: string
}

export interface MookTrait extends _MookItem {
	points: number
	cr: number
	levels: number
	modifiers: MookTraitModifier[]
}

export interface MookTraitModifier extends _MookItem {
	cost: string
}

export interface MookSkill extends _MookItem {
	specialization: string
	tech_level: string
	difficulty: `${string}/${difficulty.Level}`
	points: number
	level: number
}

export interface MookSpell extends _MookItem {
	// specialization: string
	tech_level: string
	difficulty: `${string}/${difficulty.Level}`
	points: number
	level: number
	college: Array<string>
}

export interface MookWeapon extends _MookItem {
	strength: string
	damage: WeaponDamageObj
	level: number
}

export interface MookMelee extends MookWeapon {
	reach: string
	parry: string
	block: string
}

export interface MookRanged extends MookWeapon {
	accuracy: string
	range: string
	rate_of_fire: string
	shots: string
	bulk: string
	recoil: string
	// reference: string
	// reference_highlight: string
}

export interface MookEquipment extends _MookItem {
	quantity: number
	tech_level: string
	legality_class: string
	value: number
	weight: string
	uses: number
	max_uses: number
}

export type MookNote = _MookItem
