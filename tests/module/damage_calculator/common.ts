import { IDamageCalculator, createDamageCalculator } from "@module/apps/damage_calculator/damage_calculator.ts"
import { DamageTypes } from "@module/apps/damage_calculator/damage_type.ts"
import {
	DamageAttacker,
	DamageHit,
	DamageRoll,
	DamageTarget,
	TargetPool,
	TargetTrait,
	TargetTraitModifier,
} from "@module/apps/damage_calculator/index.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { HitLocationObj } from "@sytem/hit_location/data.ts"
import { BodyGURPS, HitLocation } from "@sytem/hit_location/object.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { BodyOwner } from "@util"

export class _Attacker implements DamageAttacker {
	tokenId: string = ""

	name = "Arnold"
}

const _dummyHitLocationTable = {
	name: "humanoid",
	roll: "3d",
	locations: <HitLocationObj[]>[],
}

export class _Target implements DamageTarget {
	tokenId: string = ""

	getTraits(name: string): TargetTrait[] {
		return this._traits.filter(it => it.name === name)
	}

	name = "doesn't matter"

	injuryTolerance: "None" | "Unliving" | "Homogenous" | "Diffuse" = "None"

	ST = 12

	hitPoints = { value: 15, current: 10 }

	_traits: TargetTrait[] = []

	hitLocationTable = BodyGURPS.fromObject(_dummyHitLocationTable, this)

	getTrait(name: string): TargetTrait | undefined {
		return this._traits.find(it => it.name === name)
	}

	hasTrait(name: string): boolean {
		return !!this.getTrait(name)
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	incrementDamage(_delta: number): void {}

	pools: TargetPool[] = [
		{ id: "hp", name: "HP", fullName: "Hit Points" },
		{ id: "fp", name: "FP", fullName: "Fatigue Points" },
	]

	addDRBonusesFor(_id: string, _tooltip: TooltipGURPS | null, drMap: Map<string, number>): Map<string, number> {
		return drMap
	}
}

export class _DamageRoll implements DamageRoll {
	damageText = ""

	damageTypeKey = ""

	applyTo = "HP"

	hits: DamageHit[] = [{ basicDamage: 0, locationId: "torso" }]

	attacker = new _Attacker()

	dice = new DiceGURPS("2d")

	basicDamage = 0

	damageType = DamageTypes.cr

	weapon = undefined

	range = null

	damageModifier = ""

	armorDivisor = 1

	isHalfDamage = false

	isShotgunCloseRange = false

	rofMultiplier = 1

	internalExplosion = false
}

export const Knockdown = [
	{ id: "stun", margin: 0 },
	{ id: "fall prone", margin: 0 },
	{ id: "unconscious", margin: 5 },
]

export type DamageShock = { damage: number; shock: number }

const dummyLocalize = (stringId: string, data?: Record<string, unknown>) => {
	return `${stringId}${data ? `:${JSON.stringify(data)}` : ""}`
}

export const _create = function (roll: DamageRoll, target: DamageTarget): IDamageCalculator {
	return createDamageCalculator(roll, target, dummyLocalize)
}

export class _TargetTrait implements TargetTrait {
	name: string

	levels: number

	constructor(name: string, levels: number) {
		this.name = name
		this.levels = levels
	}

	getModifier(name: string): TargetTraitModifier | undefined {
		return this.modifiers.find(it => it.name === name)
	}

	modifiers: TargetTraitModifier[] = []
}

export class _TargetTraitModifier implements TargetTraitModifier {
	levels: number

	name: string

	constructor(name: string, levels: number) {
		this.name = name
		this.levels = levels
	}
}

export class DamageHitLocation extends HitLocation {
	_map: Map<string, number> = new Map()

	override _DR(_tooltip: TooltipGURPS | null, _drMap: Map<string, number> = new Map()): Map<string, number> {
		return this._map
	}

	static override fromObject(
		data: HitLocationObj,
		actor: BodyOwner,
		owningTable?: BodyGURPS | undefined,
	): DamageHitLocation {
		const location = super.fromObject(data, actor, owningTable) as DamageHitLocation
		location._map = new Map()
		return location
	}
}
