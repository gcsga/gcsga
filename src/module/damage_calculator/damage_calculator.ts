import { DiceGURPS } from "@module/dice"
import {
	DamageAttacker,
	DamageHit,
	DamageRoll,
	DamageTarget,
	DamageWeapon,
	DefaultHitLocations,
	TargetPool,
	TargetTrait,
	Vulnerability,
} from "."
import { RollType } from "../data"
import { AnyPiercingType, DamageType, DamageTypes } from "./damage_type"
import { HitLocationUtil } from "./hitlocation_utils"
import {
	CheckFailureConsequence,
	EffectCheck,
	InjuryEffect,
	InjuryEffectType,
	KnockdownCheck,
	RollModifier,
} from "./injury_effect"
import { HitLocation, HitLocationTable } from "@actor"

export const Head = ["skull", "eye", "face"]
export const Limb = ["arm", "leg"]
export const Extremity = ["hand", "foot"]
const Torso = "torso"

type StepName = "Basic Damage" | "Damage Resistance" | "Penetrating Damage" | "Wounding Modifier" | "Injury"

type KeyValue = { key: string; value: number }

// TODO Localize the substep strings (and any text in the text field).
class CalculatorStep {
	constructor(name: StepName, substep: string, value: number, text: string | undefined, notes: string | undefined) {
		this.name = name
		this.substep = substep
		this.value = value
		this.text = text ?? `${value}`
		this.notes = notes
	}

	name: StepName

	substep: string

	value: number

	text: string

	notes?: string
}

export class DamageResults {
	steps = <Array<CalculatorStep>>[]

	knockback = 0

	effects = <Array<InjuryEffect>>[]

	addResult(result: CalculatorStep | undefined) {
		if (result) this.steps.push(result)
	}

	addEffects(effects: InjuryEffect[]) {
		if (effects) this.effects.push(...effects)
	}

	get injury() {
		return this.reverseList.find(it => it.name === "Injury")
	}

	get woundingModifier() {
		return this.reverseList.find(it => it.name === "Wounding Modifier")
	}

	get penetratingDamage() {
		return this.reverseList.find(it => it.name === "Penetrating Damage")
	}

	get damageResistance() {
		return this.reverseList.find(it => it.name === "Damage Resistance")
	}

	get basicDamage() {
		return this.reverseList.find(it => it.name === "Basic Damage")
	}

	get rawDamage() {
		return this.steps.find(it => it.name === "Basic Damage" && it.substep === "gurps.dmgcalc.substep.basic_damage")
	}

	get miscellaneousEffects(): InjuryEffect[] {
		return this.effects.filter(
			it => ![InjuryEffectType.knockback, InjuryEffectType.majorWound, InjuryEffectType.shock].includes(it.id)
		)
	}

	get knockbackEffects(): InjuryEffect[] {
		return this.effects.filter(it => it.id === InjuryEffectType.knockback)
	}

	get shockEffects(): InjuryEffect[] {
		return this.effects.filter(it => it.id === InjuryEffectType.shock)
	}

	get majorWoundEffects(): InjuryEffect[] {
		return this.effects.filter(it => it.id === InjuryEffectType.majorWound)
	}

	private get reverseList(): CalculatorStep[] {
		const temp = [...this.steps]
		return temp.reverse()
	}
}

type Overrides = {
	basicDamage: number | undefined
	flexible: boolean | undefined
	hardenedDR: number | undefined
	rawDR: number | undefined
	woundingModifier: number | undefined
}

type ContainerOverrides = {
	armorDivisor: number | undefined
	damagePool: string | undefined
	damageReduction: number | undefined
	damageType: DamageType | undefined
	injuryTolerance: string | undefined
	vulnerability: number | undefined
}

export interface IDamageCalculator {
	readonly hits: LocationDamage[]

	readonly isOverridden: boolean
	resetOverrides(): void

	// === Attacker ===
	readonly attacker: DamageAttacker | undefined
	readonly weapon: DamageWeapon | undefined
	readonly damagePoolID: string
	readonly dice: DiceGURPS

	readonly armorDivisor: number
	armorDivisorOverride: number | undefined

	readonly damageTypeKey: string
	damageTypeOverride: string | undefined

	readonly isExplosion: boolean
	readonly isInternalExplosion: boolean
	readonly range: number | null
	readonly isHalfDamage: boolean
	readonly isShotgunCloseRange: boolean
	readonly rofMultiplier: number

	// === Target ===
	readonly target: DamageTarget

	readonly injuryTolerance: string
	injuryToleranceOverride: string | undefined

	vulnerabilities: Vulnerability[]
	readonly vulnerabilityLevel: number
	vulnerabilityOverride: number | undefined
	applyVulnerability(index: number, checked: boolean): void

	readonly damageReduction: number
	damageReductionOverride: number | undefined
}

interface LocationDamage {
	hitLocation: HitLocation | undefined
	readonly isOverridden: boolean
	readonly results: DamageResults
	readonly drForHitLocation: KeyValue

	readonly basicDamage: number
	basicDamageOverride: number | undefined

	locationId: string | undefined

	readonly damageResistance: number
	damageResistanceOverride: number | undefined

	readonly isFlexibleArmor: boolean
	flexibleArmorOverride: boolean | undefined

	readonly hardenedDRLevel: number
	hardenedDROverride: number | undefined

	readonly woundingModifier: number
	woundingModifierOverride: number | undefined

	readonly isLargeAreaInjury: boolean
	readonly hitLocationTable: HitLocationTable
}

const formatFraction = (value: number) => {
	if (value === 0.5) return "1/2"
	if (value === 1 / 3) return "1/3"
	if (value === 2 / 3) return "2/3"
	if (value === 0.2) return "1/5"
	if (value === 0.1) return "1/10"
	return `${value}`
}

/**
 * Represents a collection of DamageCalculatorComponents all with the same target and "base" damage roll.
 * The components only differ in basicDamage and hitlocation.
 */
export class DamageCalculator implements IDamageCalculator {
	constructor(damageRoll: DamageRoll, defender: DamageTarget, localize: (stringId: string, data?: any) => string) {
		if (damageRoll.armorDivisor < 0) throw new Error(`Invalid Armor Divisor value: [${damageRoll.armorDivisor}]`)

		this.target = defender
		this.damageRoll = damageRoll
		this.format = localize

		// Precreate and cache the list of vulnerabilities.
		this.vulnerabilities = this.vulnerabilitiesAsObjects

		damageRoll.hits.forEach(it => this.hits.push(new HitLocationDamage(it, this)))
	}

	target: DamageTarget

	private damageRoll: DamageRoll

	format: (stringId: string, data?: any) => string

	hits: LocationDamage[] = []

	private overrides: ContainerOverrides = {
		armorDivisor: undefined,
		damagePool: undefined,
		damageReduction: undefined,
		damageType: undefined,
		injuryTolerance: undefined,
		vulnerability: undefined,
	}

	isOverridden = false

	resetOverrides(): void {
		throw new Error("Method not implemented.")
	}

	get multiplierForShotgunExtremelyClose() {
		return this.isShotgunCloseRange ? Math.floor(this.rofMultiplier / 2) : 1
	}

	// === Attacker ===
	get attacker(): DamageAttacker | undefined {
		return this.damageRoll.attacker
	}

	get weapon(): DamageWeapon | undefined {
		return this.damageRoll.weapon
	}

	get dice(): DiceGURPS {
		return this.damageRoll.dice
	}

	// --- Damage Type ---
	get damageType(): DamageType {
		return this.overrides.damageType ?? this.damageRoll.damageType
	}

	get damageTypeKey(): string {
		return this.damageRoll.damageType.id
	}

	set damageTypeOverride(key: string | undefined) {
		if (key === undefined) this.overrides.damageType = undefined
		else {
			const value = getProperty(DamageTypes, key) as DamageType
			this.overrides.damageType = this.damageRoll.damageType === value ? undefined : value
		}
	}

	get damageTypeOverride(): string | undefined {
		return this.overrides.damageType?.id
	}

	// --- Armor Divisor ---
	get armorDivisor() {
		return this.overrides.armorDivisor ?? this.damageRoll.armorDivisor
	}

	get armorDivisorOverride(): number | undefined {
		return this.overrides.armorDivisor
	}

	set armorDivisorOverride(value: number | undefined) {
		this.overrides.armorDivisor = this.damageRoll.armorDivisor === value ? undefined : value
	}

	private isIgnoreDRArmorDivisor(hit: LocationDamage): boolean {
		return this.effectiveArmorDivisor(hit) === 0
	}

	private effectiveArmorDivisor(hit: LocationDamage): number {
		let ad = this.armorDivisor
		if (ad > 0 && ad < 1) return ad

		// If this is an explosion, and the target is collateral damage, ignore Armor Divisors.
		// My assumption is that this is true regardless of whether the AD is > 1 or < 1.
		if (this.isCollateralDamage) {
			return 1
		}

		const armorDivisors = [0, 100, 10, 5, 3, 2, 1]
		let index = armorDivisors.indexOf(ad)

		index += hit.hardenedDRLevel
		if (index > armorDivisors.length - 1) index = armorDivisors.length - 1

		return armorDivisors[index]
	}

	// --- Damage Pool ---
	// TODO - Pull a list of damage types from a system setting.
	// TODO - Get a mapping of damage type to damage pool from a system setting.

	get damagePoolID(): string {
		// defender.actor.poolAttributes()
		if (this.overrides.damagePool) return this.overrides.damagePool
		return this.damageType.pool_id ?? "hp"
	}

	get damagePools(): TargetPool[] {
		return this.target.pools
	}

	// --- Damage Reduction ---
	get damageReduction(): number {
		return this.overrides.damageReduction ?? this.damageReductionValue
	}

	get damageReductionOverride(): number | undefined {
		return this.overrides.damageReduction
	}

	set damageReductionOverride(value: number | undefined) {
		this.overrides.damageReduction = this.damageReductionValue === value ? undefined : value
	}

	private get damageReductionValue() {
		let trait = this.target.getTrait("Damage Reduction")
		return trait ? trait.levels : 1
	}

	// --- Injury Tolerance ---
	get injuryTolerance(): string {
		return this.overrides.injuryTolerance ?? this.target.injuryTolerance
	}

	get injuryToleranceOverride(): string | undefined {
		return this.overrides.injuryTolerance
	}

	set injuryToleranceOverride(value: string | undefined) {
		this.overrides.injuryTolerance = this.target.injuryTolerance === value ? undefined : value
	}

	get isUnliving(): boolean {
		return this.injuryTolerance === "Unliving"
	}

	get isHomogenous(): boolean {
		return this.injuryTolerance === "Homogenous"
	}

	get isDiffuse(): boolean {
		return this.injuryTolerance === "Diffuse"
	}

	get isExplosion(): boolean {
		return this.damageRoll.damageModifier === "ex"
	}

	// -- Vulnerability --
	vulnerabilities: Vulnerability[]

	get vulnerabilityLevel(): number {
		return (
			this.overrides.vulnerability ??
			Math.max(
				1,
				this.vulnerabilities.filter(it => it.apply).reduce((acc, cur) => acc * cur.value, 1)
			)
		)
	}

	get vulnerabilityOverride(): number | undefined {
		return this.overrides.vulnerability
	}

	set vulnerabilityOverride(value: number | undefined) {
		this.overrides.vulnerability = value
	}

	applyVulnerability(index: number, checked: boolean) {
		this.vulnerabilities[index].apply = checked
	}

	private get vulnerabilitiesAsObjects(): Vulnerability[] {
		// Find all traits with name "Vulnerability".
		// Convert to a Vulnerability object.
		return this.target.getTraits("Vulnerability").map(
			it =>
				<Vulnerability>{
					name: it.modifiers.map(it => it.name).join("; "),
					value: this._vulnerabilityLevel(it),
					apply: false,
				}
		)
	}

	private _vulnerabilityLevel(trait: TargetTrait): number {
		if (trait?.getModifier("Wounding x2")) return 2
		if (trait?.getModifier("Wounding x3")) return 3
		if (trait?.getModifier("Wounding x4")) return 4
		return 1
	}

	// --- Other Attack Properties ---
	get damageModifier(): string {
		return this.damageRoll.damageModifier
	}

	get isInternalExplosion(): boolean {
		return this.isExplosion && this.damageRoll.internalExplosion
	}

	get range(): number | null {
		return this.damageRoll.range
	}

	get isHalfDamage(): boolean {
		return this.damageRoll.isHalfDamage
	}

	get isShotgunCloseRange(): boolean {
		return this.damageRoll.isShotgunCloseRange
	}

	get rofMultiplier(): number {
		return this.damageRoll.rofMultiplier
	}

	get isKnockbackOnly() {
		return this.damageType === DamageTypes.kb
	}

	get diceOfDamage(): number {
		return this.dice.count
	}

	get isCollateralDamage(): boolean {
		return this.isExplosion && this.isAtRange
	}

	get isAtRange(): boolean {
		return this.range != null && this.range > 0
	}

	isTightBeamBurning() {
		return this.damageType === DamageTypes.burn && this.damageModifier === "tbb"
	}

	// === Step Calculations ===

	addBasicDamageSteps(results: DamageResults, basicDamage: number): void {
		results.addResult(
			new CalculatorStep(
				"Basic Damage",
				"gurps.dmgcalc.substep.basic_damage",
				basicDamage,
				undefined,
				this.format("gurps.dmgcalc.damage_pool.hp")
			)
		)
		results.addResult(this.adjustBasicDamage(basicDamage))
	}

	/**
	 * Add steps to adjust Basic Damage for explosion, knockback, half damage, and shotgun.
	 * @param basicDamage The basic damage value of the hit.
	 * @returns  A CalculatorStep to add to the results.
	 */
	adjustBasicDamage(basicDamage: number): CalculatorStep | undefined {
		const STEP = this.format("gurps.dmgcalc.substep.adjusted_damage")

		if (this.isExplosion && this.range) {
			if (this.range > this.diceOfDamage * 2) {
				return new CalculatorStep(
					"Basic Damage",
					STEP,
					0,
					undefined,
					this.format("gurps.dmgcalc.description.explosion_outofrange")
				)
			} else {
				return new CalculatorStep(
					"Basic Damage",
					STEP,
					Math.floor(basicDamage / (3 * this.range)),
					undefined,
					this.format("gurps.dmgcalc.description.explosion_range", {
						range: this.range,
					})
				)
			}
		}

		if (this.isKnockbackOnly)
			return new CalculatorStep(
				"Basic Damage",
				STEP,
				0,
				undefined,
				this.format("gurps.dmgcalc.description.knockback_only")
			)

		if (this.isHalfDamage) {
			return new CalculatorStep(
				"Basic Damage",
				STEP,
				basicDamage * 0.5,
				undefined,
				this.format("gurps.dmgcalc.description.ranged_halfd")
			)
		}

		if (this.multiplierForShotgunExtremelyClose !== 1) {
			return new CalculatorStep(
				"Basic Damage",
				STEP,
				basicDamage * this.multiplierForShotgunExtremelyClose,
				undefined,
				this.format("gurps.dmgcalc.description.shotgun", {
					multiplier: this.multiplierForShotgunExtremelyClose,
				})
			)
		}

		return undefined
	}

	/**
	 * Adds damage resistance steps to the results based on the given hit.
	 * @param results - The damage results object.
	 * @param hit - The damage to location object.
	 */
	addDamageResistanceSteps(results: DamageResults, hit: LocationDamage): void {
		const dr = this.damageResistanceAndReason(hit)
		results.addResult(
			new CalculatorStep(
				"Damage Resistance",
				"gurps.dmgcalc.substep.damage_resistance",
				dr.value,
				undefined,
				dr.key
			)
		)
		results.addResult(this.adjustDamageResistance(results.damageResistance!.value, hit))
	}

	/**
	 * Calculates the damage resistance and reason for a given hit.
	 * @param hit The damage to location object.
	 * @returns An object containing the key and value of the damage resistance and reason.
	 */
	damageResistanceAndReason(hit: LocationDamage): KeyValue {
		if (hit.damageResistanceOverride)
			return {
				key: this.format("gurps.dmgcalc.override"),
				value: hit.damageResistanceOverride,
			}

		if (hit.isLargeAreaInjury) {
			let torso = HitLocationUtil.getHitLocation(hit.hitLocationTable, Torso)

			let allDR: number[] = hit.hitLocationTable.locations
				.map(it => HitLocationUtil.getHitLocationDR(it, this.damageType))
				.filter(it => it !== -1)

			const basicDr = (HitLocationUtil.getHitLocationDR(torso, this.damageType) + Math.min(...allDR)) / 2
			return { key: this.format("gurps.dmgcalc.description.large_area_injury"), value: basicDr }
		}
		return hit.drForHitLocation
	}

	/**
	 * Adjusts the damage resistance based on the given parameters.
	 * @param dr - The damage resistance value.
	 * @param hit - The location damage.
	 * @returns A CalculatorStep object representing the adjusted damage resistance,
	 *          or undefined if no adjustment is needed.
	 */
	adjustDamageResistance(dr: number, hit: LocationDamage): CalculatorStep | undefined {
		const STEP = "gurps.dmgcalc.substep.effective_dr"

		// Armor Divisor is "Ignores DR"
		if (this.isIgnoreDRArmorDivisor(hit))
			return new CalculatorStep(
				"Damage Resistance",
				STEP,
				0,
				undefined,
				this.format("gurps.dmgcalc.description.armor_divisor_ignores")
			)

		if (this.isInternalExplosion)
			return new CalculatorStep(
				"Damage Resistance",
				STEP,
				0,
				undefined,
				this.format("gurps.dmgcalc.description.explosion_internal")
			)

		if (this.damageType === DamageTypes.injury)
			return new CalculatorStep(
				"Damage Resistance",
				STEP,
				0,
				undefined,
				this.format("gurps.dmgcalc.description.ignores_dr")
			)

		if (this.multiplierForShotgunExtremelyClose > 1) {
			return new CalculatorStep(
				"Damage Resistance",
				STEP,
				dr * this.multiplierForShotgunExtremelyClose,
				undefined,
				this.format("gurps.dmgcalc.description.shotgun", {
					multiplier: this.multiplierForShotgunExtremelyClose,
				})
			)
		}

		const effectiveAD = this.effectiveArmorDivisor(hit)
		if (effectiveAD !== 1) {
			let result = Math.floor(dr / effectiveAD)
			result = effectiveAD < 1 ? Math.max(result, 1) : result
			return new CalculatorStep(
				"Damage Resistance",
				STEP,
				result,
				undefined,
				this.format("gurps.dmgcalc.description.armor_divisor", {
					divisor: effectiveAD,
				})
			)
		}

		return undefined
	}

	/**
	 * Adds the steps for calculating penetrating damage to the given DamageResults object.
	 * Penetrating damage is calculated as the difference between the basic damage and the damage resistance,
	 * with a minimum value of 0.
	 *
	 * @param results - The DamageResults object to add the penetrating damage steps to.
	 */
	addPenetratingDamageSteps(results: DamageResults): void {
		results.addResult(
			new CalculatorStep(
				"Penetrating Damage",
				"gurps.dmgcalc.substep.penetrating",
				Math.max(results.basicDamage!.value - results.damageResistance!.value, 0),
				undefined,
				`= ${results.basicDamage!.value} – ${results.damageResistance!.value}`
			)
		)
	}

	/**
	 * Adds the wounding modifier steps to the damage results.
	 * @param results The damage results object.
	 * @param hit The location damage object.
	 */
	addWoundingModifierSteps(results: DamageResults, hit: LocationDamage): void {
		const STEP = "gurps.dmgcalc.substep.wounding_modifier"

		const [value, reason] = this.woundingModifierAndReason(hit)
		results.addResult(new CalculatorStep("Wounding Modifier", STEP, value, `×${formatFraction(value)}`, reason))

		results.addResult(this.adjustWoundingModifierForInjuryTolerance(results.woundingModifier!.value, hit))
		results.addResult(this.adjustWoundingModifierForVulnerabilities(results.woundingModifier!.value))
	}

	/**
	 * Adjusts the wounding modifier for injury tolerance.
	 * @param woundingModifier - The original wounding modifier.
	 * @param hit - The location damage.
	 * @returns The calculator step if the wounding modifier is adjusted, otherwise undefined.
	 */
	private adjustWoundingModifierForInjuryTolerance(
		woundingModifier: number,
		hit: LocationDamage
	): CalculatorStep | undefined {
		const mod = this.modifierByInjuryTolerance(hit)
		if (mod && mod[0] !== woundingModifier) {
			const newValue = mod[0]
			return new CalculatorStep(
				"Wounding Modifier",
				"gurps.dmgcalc.substep.injury_tolerance",
				newValue,
				`×${formatFraction(newValue)}`,
				mod[1]
			)
		}

		return undefined
	}

	/**
	 * Calculates the modifier for injury tolerance based on the hit location damage.
	 *
	 * @param hit The location damage information.
	 * @returns An array containing the modifier value and the corresponding description, or undefined if no
	 *  modifier applies.
	 */
	private modifierByInjuryTolerance(hit: LocationDamage): [number, string] | undefined {
		/**
		 * TODO Diffuse: Exception: Area-effect, cone, and explosion attacks cause normal injury.
		 */
		if (this.isHomogenous) return [this.damageType.homogenous, this.format("gurps.dmgcalc.tolerance.homogenous")]

		// Unliving uses unliving modifiers unless the hit location is skull, eye, or vitals.
		if (this.isUnliving && !["skull", "eye", "vitals"].includes(hit.locationId!))
			return [this.damageType.unliving, this.format("gurps.dmgcalc.tolerance.unliving")]

		// No Brain has no extra wounding modifier if hit location is skull or eye.
		if (this.target.hasTrait("No Brain") && ["skull", "eye"].includes(hit.locationId!))
			return [this.damageType.woundingModifier, this.format("gurps.dmgcalc.description.no_brain")]

		if (this.isDiffuse && this.woundingModifierByHitLocation(hit.locationId!)) {
			return [this.damageType.woundingModifier, this.format("gurps.dmgcalc.description.diffuse")]
		}

		return undefined
	}

	/**
	 * @returns {number} wounding modifier only based on hit location.
	 */
	woundingModifierByHitLocation(locationId: string): [number, string] | undefined {
		const standardMessage = this.format("gurps.dmgcalc.description.damage_location", {
			type: this.format(`gurps.dmgcalc.type.${this.damageType.id}`),
			location: locationId,
		})

		switch (locationId) {
			case "vitals":
				if ([DamageTypes.imp, ...AnyPiercingType].includes(this.damageType)) return [3, standardMessage]
				if (this.isTightBeamBurning())
					return [
						2,
						this.format("gurps.dmgcalc.description.tight_beam_burn", {
							location: locationId,
						}),
					]
				break

			case "skull":
			case "eye":
				if (this.damageType !== DamageTypes.tox) return [4, standardMessage]
				break

			case "face":
				if (this.damageType === DamageTypes.cor) return [1.5, standardMessage]
				break

			case "neck":
				if ([DamageTypes.cor, DamageTypes.cr].includes(this.damageType)) return [1.5, standardMessage]
				if (this.damageType === DamageTypes.cut) return [2, standardMessage]
				break

			case "hand":
			case "foot":
			case "arm":
			case "leg":
				if ([DamageTypes["pi+"], DamageTypes["pi++"], DamageTypes.imp].includes(this.damageType))
					return [1, standardMessage]
				break
		}
		return undefined
	}

	/**
	 * Adjusts the wounding modifier for vulnerabilities.
	 * @param woundingModifier - The original wounding modifier.
	 * @returns A CalculatorStep object representing the adjusted wounding modifier, or undefined if no adjustment
	 *  is needed.
	 */
	private adjustWoundingModifierForVulnerabilities(woundingModifier: number): CalculatorStep | undefined {
		// Adjust for Vulnerability
		if (this.vulnerabilityLevel !== 1) {
			let temp = woundingModifier * this.vulnerabilityLevel
			return new CalculatorStep(
				"Wounding Modifier",
				"gurps.dmgcalc.substep.effective_modifier",
				temp,
				`×${formatFraction(temp)}`,
				this.format("gurps.dmgcalc.description.vulnerability", {
					modifier: formatFraction(woundingModifier),
					vulnerability: this.vulnerabilityLevel,
				})
			)
		}

		return undefined
	}

	woundingModifierAndReason(hit: LocationDamage): [number, string] {
		if (hit.woundingModifierOverride)
			return <[number, string]>[hit.woundingModifierOverride, this.format("gurps.dmgcalc.override")]

		if (this.woundingModifierByDamageType) return this.woundingModifierByDamageType

		const modifierAndReason = this.woundingModifierByHitLocation(hit.locationId!)
		if (modifierAndReason) return modifierAndReason

		const standardMessage = this.format("gurps.dmgcalc.description.damage_location", {
			type: this.format(`gurps.dmgcalc.type.${this.damageType.id}`),
			location: hit.locationId,
		})

		return <[number, string]>[this.damageType.woundingModifier, standardMessage]
	}

	get woundingModifierByDamageType(): [number, string] | undefined {
		// Fatigue damage always ignores hit location.
		if (this.damageType === DamageTypes.fat) return [1, this.format("gurps.dmgcalc.description.fatigue")]
		return undefined
	}

	get shockFactor(): number {
		return Math.floor(this.target.hitPoints.value / 10)
	}

	/**
	 * @returns {number} the maximum injury based on Injury Tolerance, or Infinity.
	 */
	get maximumForInjuryTolerance(): [number, string] {
		if (this.isDiffuse) {
			if ([DamageTypes.imp, ...AnyPiercingType].includes(this.damageType))
				return [1, this.format("gurps.dmgcalc.description.diffuse_max", { value: 1 })]
			return [2, this.format("gurps.dmgcalc.description.diffuse_max", { value: 2 })]
		}
		return [Infinity, ""]
	}
}

/**
 * Represents one application of damage to a single hit location. Works in tandem with DamageCalculator.
 */
class HitLocationDamage implements LocationDamage {
	constructor(hit: DamageHit, calculator: DamageCalculator) {
		this.hit = hit
		this.calculator = calculator
	}

	calculator: DamageCalculator

	hit: DamageHit

	get locationId(): string {
		return this.hit.locationId
	}

	set locationId(value: string) {
		this.hit.locationId = value
	}

	private get damageType(): DamageType {
		return this.calculator.damageType
	}

	private get vulnerabilities() {
		return this.calculator.vulnerabilities
	}

	private format(arg0: string, data?: any): string {
		return this.calculator.format(arg0, data)
	}

	private get isHomogenous(): boolean {
		return this.calculator.isHomogenous
	}

	private get isDiffuse(): boolean {
		return this.calculator.isDiffuse
	}

	private get damageReduction() {
		return this.calculator.damageReduction
	}

	get hitLocationTable(): HitLocationTable {
		return this.calculator.target.hitLocationTable
	}

	get drForHitLocation(): KeyValue {
		return {
			key: `${this.hitLocation?.choice_name}`,
			value:
				this.overrides.rawDR ?? HitLocationUtil.getHitLocationDR(this.hitLocation, this.calculator.damageType),
		}
	}

	/*
	 * TODO Sometime in the future, I want to save the overrides and vulnerabilities on the target in a map keyed by
	 * Attacker and Weapon. Then, whenever we create a DamageCalculator, we can check to see if we have a cached set
	 * of overrides and vulnerabilities for tthe current Attacker and Weapon, and restore the values from the cache.
	 * This should make the use of the DamageCalculator much more efficient for the user. The cache would be cleared
	 * when removing the actor from combat (or ending combat).
	 */
	overrides: Overrides = {
		basicDamage: undefined,
		flexible: undefined,
		hardenedDR: undefined,
		rawDR: undefined,
		woundingModifier: undefined,
	}

	resetOverrides() {
		let key: keyof Overrides
		for (key in this.overrides) {
			this.overrides[key] = undefined
		}

		for (const trait of this.vulnerabilities) {
			trait.apply = false
		}
	}

	get isOverridden(): boolean {
		return Object.values(this.overrides).some(it => it !== undefined)
	}

	get results(): DamageResults {
		const results = new DamageResults()

		// Basic Damage
		this.calculator.addBasicDamageSteps(results, this.basicDamage)

		// Damage Resistance
		this.calculator.addDamageResistanceSteps(results, this)

		// Penetrating Damge = Basic Damage - Damage Resistance
		this.calculator.addPenetratingDamageSteps(results)

		// Wounding Modifier
		this.calculator.addWoundingModifierSteps(results, this)

		// Injury = Penetrating Damage * Wounding Modifier
		this.addInjurySteps(results)

		results.knockback = this.knockback(results)
		results.addEffects(this.knockbackEffects(results.knockback))
		results.addEffects(this.shockEffects(results))
		results.addEffects(this.majorWoundEffects(results))
		results.addEffects(this.miscellaneousEffects(results))
		return results
	}

	private addInjurySteps(results: DamageResults): void {
		let value = Math.floor(results.woundingModifier!.value * results.penetratingDamage!.value)
		if (results.woundingModifier!.value !== 0 && value === 0 && results.penetratingDamage!.value > 0) value = 1
		results.addResult(
			new CalculatorStep(
				"Injury",
				"gurps.dmgcalc.substep.injury",
				value,
				undefined,
				`= ${results.penetratingDamage!.value} × ${formatFraction(results.woundingModifier!.value)}`
			)
		)
		this.adjustInjury(results)

		// Adjust for Damage Reduction.
		if (this.damageReduction !== 1) {
			const newValue = Math.ceil(results.injury!.value / this.damageReduction)
			results.addResult(
				new CalculatorStep(
					"Injury",
					"gurps.dmgcalc.substep.damage_reduction",
					newValue,
					undefined,
					this.format("gurps.dmgcalc.description.damage_reduction", {
						injury: results.injury!.value,
						reduction: this.damageReduction,
					})
				)
			)
		}

		// Adjust for hit location.
		const maxResult = this.maximumForHitLocation
		const newValue = Math.min(results.injury!.value, maxResult[0])
		if (newValue < results.injury!.value) {
			results.addResult(
				new CalculatorStep("Injury", "gurps.dmgcalc.substep.max_location", newValue, undefined, maxResult[1])
			)
		}
	}

	private adjustInjury(results: DamageResults): void {
		const STEP = "gurps.dmgcalc.substep.adjusted_injury"

		// Adjust for Injury Tolerance. This must be before Hit Location or Trauma.
		const maximumForInjuryTolerance = this.calculator.maximumForInjuryTolerance
		let newValue = Math.min(results.injury!.value, maximumForInjuryTolerance[0])
		if (newValue < results.injury!.value) {
			results.addResult(new CalculatorStep("Injury", STEP, newValue, undefined, maximumForInjuryTolerance[1]))
		}

		if (this.isDiffuse) return

		// Adjust for blunt trauma.
		if (this.isBluntTrauma(results)) {
			results.addResult(
				new CalculatorStep(
					"Injury",
					STEP,
					this.bluntTrauma(results),
					undefined,
					this.format("gurps.dmgcalc.description.blunt_trauma")
				)
			)
		}
	}

	private isBluntTrauma(results: DamageResults): boolean {
		return (
			this.isFlexibleArmor &&
			results.penetratingDamage!.value === 0 &&
			this.damageType.bluntTraumaDivisor > 1 &&
			this.bluntTrauma(results) > 0
		)
	}

	/**
	 * @returns {number} the amount of blunt trauma damage, if any.
	 */
	private bluntTrauma(results: DamageResults): number {
		if (results.penetratingDamage!.value > 0 || !this.isFlexibleArmor) return 0
		return this.damageType.bluntTraumaDivisor > 0
			? Math.floor(results.basicDamage!.value / this.damageType.bluntTraumaDivisor)
			: 0
	}

	/**
	 * @returns the maximum injury based on hit location, or Infinity if none.
	 */
	private get maximumForHitLocation(): [number, string] {
		if (Limb.includes(this.hit.locationId)) {
			const max = Math.floor(this.calculator.target.hitPoints.value / 2) + 1
			return [
				max,
				this.format("gurps.dmgcalc.description.location_max", {
					value: max,
					location: this.hit.locationId,
				}),
			]
		}

		if (Extremity.includes(this.hit.locationId)) {
			const max = Math.floor(this.calculator.target.hitPoints.value / 3) + 1
			return [
				max,
				this.format("gurps.dmgcalc.description.location_max", {
					value: max,
					location: this.hit.locationId,
				}),
			]
		}

		return [Infinity, ""]
	}

	/**
	 * @returns {number} yards of knockback, if any.
	 */
	private knockback(results: DamageResults): number {
		if (this.isDamageTypeKnockbackEligible) {
			if (this.damageType === DamageTypes.cut && results.penetratingDamage!.value > 0) return 0

			// console.log(results)
			return Math.floor(results.rawDamage!.value / (this.knockbackResistance - 2))
		}
		return 0
	}

	private get isDamageTypeKnockbackEligible() {
		return [DamageTypes.cr, DamageTypes.cut, DamageTypes.kb].includes(this.damageType)
	}

	private get knockbackResistance() {
		return this.calculator.target.ST
	}

	private knockbackEffects(knockback: number): InjuryEffect[] {
		if (knockback === 0) return []

		let penalty = knockback === 1 ? 0 : -1 * (knockback - 1)

		if (this.calculator.target.hasTrait("Perfect Balance")) penalty += 4

		const knockbackEffect = new InjuryEffect(
			InjuryEffectType.knockback,
			[],
			[
				new EffectCheck(
					[
						new RollModifier("dx", RollType.Attribute, penalty),
						new RollModifier("Acrobatics", RollType.Skill, penalty),
						new RollModifier("Judo", RollType.Skill, penalty),
					],
					[new CheckFailureConsequence("fall prone", 0)]
				),
			]
		)
		return [knockbackEffect]
	}

	private shockEffects(results: DamageResults): InjuryEffect[] {
		let rawModifier = Math.floor(results.injury!.value / this.calculator.shockFactor)
		if (rawModifier > 0) {
			let modifier = Math.min(4, rawModifier) * -1

			// TODO In RAW, this doubling only occurs if the target is physiologically male and does not have the
			// 	 "No Vitals" Injury Tolerance trait.
			if (
				this.damageType === DamageTypes.cr &&
				this.hit.locationId === "groin" &&
				!this.calculator.target.hasTrait("No Vitals")
			)
				modifier *= 2

			const shockEffect = new InjuryEffect(InjuryEffectType.shock, [
				new RollModifier("dx", RollType.Attribute, modifier),
				new RollModifier("iq", RollType.Attribute, modifier),
			])
			return [shockEffect]
		}
		return []
	}

	private majorWoundEffects(results: DamageResults): InjuryEffect[] {
		const wounds = []

		// Fatigue attacks and Injury Tolerance (Homogenous) ignore hit location.
		if (this.damageType === DamageTypes.fat || this.isHomogenous || this.isDiffuse) {
			if (this.isMajorWound(results))
				wounds.push(new InjuryEffect(InjuryEffectType.majorWound, [], [new KnockdownCheck()]))
		} else {
			switch (this.hit.locationId) {
				case "torso":
					if (this.isMajorWound(results))
						wounds.push(new InjuryEffect(InjuryEffectType.majorWound, [], [new KnockdownCheck()]))
					break

				case "skull":
				case "eye":
					if (results.shockEffects.length > 0 || this.isMajorWound(results)) {
						let penalty =
							this.damageType !== DamageTypes.tox && !this.calculator.target.hasTrait("No Brain")
								? -10
								: 0
						wounds.push(new InjuryEffect(InjuryEffectType.majorWound, [], [new KnockdownCheck(penalty)]))
					}
					break

				case "vitals":
					if (results.shockEffects.length > 0) {
						const penalty = this.calculator.target.hasTrait("No Vitals") ? 0 : -5
						wounds.push(new InjuryEffect(InjuryEffectType.majorWound, [], [new KnockdownCheck(penalty)]))
					}
					break

				case "face":
					if (this.isMajorWound(results))
						wounds.push(new InjuryEffect(InjuryEffectType.majorWound, [], [new KnockdownCheck(-5)]))
					break

				case "groin":
					if (this.isMajorWound(results)) {
						const penalty = this.calculator.target.hasTrait("No Vitals") ? 0 : -5
						wounds.push(new InjuryEffect(InjuryEffectType.majorWound, [], [new KnockdownCheck(penalty)]))
					}
					break

				default:
					if (this.isMajorWound(results))
						wounds.push(new InjuryEffect(InjuryEffectType.majorWound, [], [new KnockdownCheck()]))
			}
		}

		return wounds
	}

	private isMajorWound(results: DamageResults): boolean {
		let divisor = Extremity.includes(this.hit.locationId) ? 3 : 2
		return results.injury!.value > this.calculator.target.hitPoints.value / divisor
	}

	private miscellaneousEffects(results: DamageResults): InjuryEffect[] {
		if (this.hit.locationId === "eye" && results.injury!.value > this.calculator.target.hitPoints.value / 10)
			return [new InjuryEffect(InjuryEffectType.eyeBlinded)]

		if (this.hit.locationId === "face" && this.isMajorWound(results)) {
			return results.injury!.value > this.calculator.target.hitPoints.value
				? [new InjuryEffect(InjuryEffectType.blinded)]
				: [new InjuryEffect(InjuryEffectType.eyeBlinded)]
		}

		if (Limb.includes(this.hit.locationId) && this.isMajorWound(results)) {
			return [new InjuryEffect(InjuryEffectType.limbCrippled)]
		}

		if (Extremity.includes(this.hit.locationId) && this.isMajorWound(results)) {
			return [new InjuryEffect(InjuryEffectType.limbCrippled)]
		}

		return []
	}

	// --- Basic Damage ---

	get basicDamage(): number {
		return this.overrides.basicDamage ?? this.hit.basicDamage
	}

	get basicDamageOverride(): number | undefined {
		return this.overrides.basicDamage
	}

	set basicDamageOverride(value: number | undefined) {
		this.overrides.basicDamage = this.hit.basicDamage === value ? undefined : value
	}

	// --- Damage Resistance ---

	get damageResistance(): number {
		return this.calculator.damageResistanceAndReason(this).value
	}

	set damageResistanceOverride(dr: number | undefined) {
		this.overrides.rawDR =
			HitLocationUtil.getHitLocationDR(this.hitLocation, this.damageType) === dr ? undefined : dr
	}

	get damageResistanceOverride() {
		return this.overrides.rawDR
	}

	// --- Hardened DR ---

	get hardenedDRLevel(): number {
		return (
			this.overrides.hardenedDR ??
			this.calculator.target.getTrait("Damage Resistance")?.getModifier("Hardened")?.levels ??
			0
		)
	}

	get hardenedDROverride(): number | undefined {
		return this.overrides.hardenedDR
	}

	set hardenedDROverride(level: number | undefined) {
		this.overrides.hardenedDR = level
	}

	// --- Wounding Modifier ---

	get woundingModifier(): number {
		let woundingModifier = 1
		// let reason = undefined

		if (this.overrides.woundingModifier) {
			woundingModifier = this.overrides.woundingModifier
			// reason = "Override"
		} else if (this.calculator.woundingModifierByDamageType) {
			const modifier = this.calculator.woundingModifierByDamageType
			woundingModifier = modifier[0]
			// reason = modifier[1]
		} else if (this.calculator.woundingModifierByHitLocation(this.locationId)) {
			const modifier = this.calculator.woundingModifierByHitLocation(this.hit.locationId)
			woundingModifier = modifier ? modifier[0] : 1
			// reason = modifier[1]
		} else {
			woundingModifier = this.damageType.woundingModifier
			// reason = `${this.damageType.key}, ${this.damageRoll.locationId}`
		}
		return woundingModifier
	}

	get woundingModifierOverride(): number | undefined {
		return this.overrides.woundingModifier
	}

	set woundingModifierOverride(value: number | undefined) {
		this.overrides.woundingModifier =
			this.calculator.woundingModifierAndReason(this)[0] === value ? undefined : value
	}
	// --- ---

	get hitLocation(): HitLocation | undefined {
		return HitLocationUtil.getHitLocation(this.hitLocationTable, this.hit.locationId)
	}

	get isFlexibleArmor(): boolean {
		return (
			this.overrides.flexible ??
			HitLocationUtil.isFlexibleArmor(HitLocationUtil.getHitLocation(this.hitLocationTable, this.hit.locationId))
		)
	}

	set flexibleArmorOverride(value: boolean | undefined) {
		this.overrides.flexible = value
	}

	get isLargeAreaInjury(): boolean {
		return this.hit.locationId === DefaultHitLocations.LargeArea
	}
}
