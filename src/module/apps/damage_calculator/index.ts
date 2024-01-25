import { DiceGURPS } from "@module/dice/index.ts"
import { DamageType, DamageTypes } from "./damage_type.ts"
import { DamagePayload } from "./damage_chat_message.ts"
import { HitLocationTable } from "@actor/index.ts"

/**
 * The Damage Calculator needs three things: The DamageRoll, DamageHit, and DamageTarget.
 *
 * DamageRoll contains the information about the attacker and his weapon, including
 */
interface DamageRoll {
	attacker: DamageAttacker | undefined
	dice: DiceGURPS
	readonly damageText: string
	damageType: DamageType
	readonly applyTo: "HP" | "FP" | string
	readonly hits: DamageHit[]
	damageModifier: string
	readonly weapon: DamageWeapon | undefined

	/**
	 * Value 1 = no Armor Divisor, 0 = Ignores DR; otherwise, it takes any non-negative value.
	 */
	armorDivisor: number

	/**
	 * The multiplier on the RoF, such as the "9" of 3x9. If none, should be equal to 1.
	 */
	rofMultiplier: number

	// === RANGE MODIFIERS ===
	// The creator of this DamageRoll could either set the "isHalfDamage" and/or "isShotgunCloseRange" flags, or
	// pass in both the weapon and the range to target, in which case we can calculate the values.

	range: number | null

	/**
	 * The attack is ranged, and the range to target is greater than the 1/2D range of the weapon.
	 * Alternately, include a reference to the weapon (from which we can get the 1/2D value) and the range to the
	 * target.
	 */
	isHalfDamage: boolean

	/**
	 * A weapon with a RoF multipler (such as RoF 3x9) is within 10% of 1/2D range.
	 */
	isShotgunCloseRange: boolean
	internalExplosion: boolean
}

interface DamageHit {
	/**
	 * The body_plan location table_name, or "Default" or "Random". The DamageCalculator will resolve "Default" or
	 * "Random" to a real location id.
	 */
	locationId: string | DefaultHitLocations
	basicDamage: number
}

interface DamageAttacker {
	tokenId: string
	name: string | null
}

/**
 * An adapter on BaseWeapon and its subclasses that gives the DamageCalculator an easy interface to use.
 */
interface DamageWeapon {
	name: string

	damageDice: string
}

enum DefaultHitLocations {
	Default = "Default",
	Random = "Random",
	LargeArea = "LargeArea",
}

class DamageRollAdapter implements DamageRoll {
	/**
	 * Constructor.
	 * @param payload
	 * @param attacker
	 * @param weapon
	 */
	constructor(payload: DamagePayload, attacker: DamageAttacker | undefined, weapon: DamageWeapon | undefined) {
		this._payload = payload

		if (this._payload.index === -1) {
			this._payload.damageRoll.forEach(it => {
				this.hits.push({
					locationId: it.hitlocation,
					basicDamage: it.total,
				})
			})
		} else {
			this.hits.push({
				locationId: this._payload.damageRoll[this._payload.index].hitlocation,
				basicDamage: this._payload.damageRoll[this._payload.index].total,
			})
		}

		this.attacker = attacker
		this.weapon = weapon
		this.internalExplosion = false
		this.applyTo = ""
		this.rofMultiplier = 1
		this.range = null
		this.isHalfDamage = false
		this.isShotgunCloseRange = false
	}

	private _payload: DamagePayload

	readonly attacker: DamageAttacker | undefined

	get dice(): DiceGURPS {
		return this._payload.dice
	}

	get damageText(): string {
		return this._payload.damage
	}

	get basicDamage(): number {
		return this._payload.damageRoll[this._payload.index].total
	}

	get armorDivisor(): number {
		return this._payload.armorDivisor ?? 1
	}

	get damageType(): DamageType {
		return (DamageTypes as any)[this._payload.damageType]
	}

	readonly applyTo: string

	readonly hits: DamageHit[] = []

	get damageModifier(): string {
		return this._payload.damageModifier
	}

	readonly weapon: DamageWeapon | undefined

	readonly rofMultiplier: number

	readonly range: number | null

	readonly isHalfDamage: boolean

	readonly isShotgunCloseRange: boolean

	readonly internalExplosion: boolean
}

/**
 * Contains the interface definition(s) needed for the DamageTarget used by the DamageCalculator.
 *
 * Each component that can be used as a "damage target" needs to implement these interfaces. Those definitions should be
 * in their own files/directory, not inside the damage_calculator directory. (This is to ensure the dependencies are
 * pointing in the "correct direction".)
 */

export type HitPointsCalc = { value: number; current: number }
export type Vulnerability = { name: string; value: number; apply: boolean }
export type TargetPool = { id: string; name: string; fullName: string }

export interface DamageTarget {
	tokenId: string
	name: string
	// CharacterGURPS.attributes.get(gid.ST).calc.value.
	ST: number
	// CharacterGURPS.attributes.get(gid.HitPoints).calc.
	hitPoints: HitPointsCalc
	// CharacterGURPS.BodyType.
	hitLocationTable: HitLocationTable
	// CharacterGURPS.traits.contents.filter(it => it instanceof TraitGURPS).
	getTrait(name: string): TargetTrait | undefined
	// CharacterGURPS.traits.contents.filter(it => it instanceof TraitGURPS).
	getTraits(name: string): TargetTrait[]
	//
	hasTrait(name: string): boolean
	// Return None, Unliving, Homogenous, or Diffuse.
	injuryTolerance: "None" | "Unliving" | "Homogenous" | "Diffuse"
	// Subtract value from HitPoints.
	incrementDamage(delta: number, damagePoolId: string): void
	// Get all pools.
	pools: TargetPool[]
}

export interface TargetTrait {
	// TODO change this method to accept a Regex expression for advanced searching.
	getModifier(name: string): TargetTraitModifier | undefined
	levels: number
	name: string | null
	modifiers: TargetTraitModifier[]
}

export interface TargetTraitModifier {
	levels: number
	name: string
}

export type { DamageRoll, DamageHit, DamageAttacker, DamageWeapon }

export { DamageRollAdapter, DefaultHitLocations }
