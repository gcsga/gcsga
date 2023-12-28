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
import { TokenDocumentGURPS } from "@module/token"

export const Head = ["skull", "eye", "face"]
export const Limb = ["arm", "leg"]
export const Extremity = ["hand", "foot"]
const Torso = "torso"

export interface IDamageCalculator {
	readonly hits: LocationDamage[]

	readonly isOverridden: boolean
	resetOverrides(): void

	readonly injury: number
	injuryOverride: number | undefined
	applyTotalDamage(): void
	applyBasicDamage(index: number): unknown

	// === Attacker ===
	readonly attacker: DamageAttacker | undefined
	readonly weapon: DamageWeapon | undefined
	readonly dice: DiceGURPS

	readonly damagePoolID: string
	damagePoolOverride: string | undefined

	readonly damageTypeKey: string
	damageTypeOverride: string | undefined

	readonly isExplosion: boolean
	isExplosionOverride: boolean | undefined

	readonly isInternalExplosion: boolean
	isInternalOverride: boolean | undefined

	readonly armorDivisor: number
	armorDivisorOverride: number | undefined

	readonly range: number | undefined
	rangeOverride: number | undefined

	readonly isHalfDamage: boolean
	isHalfDamageOverride: boolean | undefined

	readonly isShotgunCloseRange: boolean
	isShotgunCloseRangeOverride: boolean | undefined

	readonly rofMultiplier: number
	rofMultiplierOverride: number | undefined

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

	readonly hitLocationTable: HitLocationTable
	readonly hitLocationChoice: Record<string, string>
}

interface LocationDamage {
	hitLocation: HitLocation | undefined

	readonly isOverridden: boolean
	resetOverrides(): void

	readonly results: DamageResults

	readonly basicDamage: number
	basicDamageOverride: number | undefined

	readonly locationName: string
	locationNameOverride: string | undefined

	readonly isLargeAreaInjury: boolean

	readonly damageResistance: ExplainedValue
	damageResistanceOverride: number | undefined

	readonly isFlexibleArmor: boolean
	flexibleArmorOverride: boolean | undefined

	readonly hardenedDRLevel: number
	hardenedDROverride: number | undefined

	readonly woundingModifier: number
	woundingModifierOverride: number | undefined
}

const formatFraction = (value: number) => {
	if (value === 0.5) return "1/2"
	if (value === 1 / 3) return "1/3"
	if (value === 2 / 3) return "2/3"
	if (value === 0.2) return "1/5"
	if (value === 0.1) return "1/10"
	return `${value}`
}

export function createDamageCalculator(
	damageRoll: DamageRoll,
	defender: DamageTarget,
	localize: (stringId: string, data?: any) => string
): IDamageCalculator {
	return new DamageCalculator(damageRoll, defender, localize)
}

const IgnoresDR = 0
const NoArmorDivisor = 1
const NotVulnerable = 1
const NoDamageReduction = 1

/**
 * The Damage Calculator is responsible for calculating the damage done to a target.
 */
class DamageCalculator implements IDamageCalculator {
	constructor(damageRoll: DamageRoll, defender: DamageTarget, localize: (stringId: string, data?: any) => string) {
		if (damageRoll.armorDivisor < 0) throw new Error(`Invalid Armor Divisor value: [${damageRoll.armorDivisor}]`)

		this.target = defender
		this.damageRoll = damageRoll
		this.format = localize

		// Precreate and cache the list of vulnerabilities.
		this.vulnerabilities = this.vulnerabilitiesAsObjects

		damageRoll.hits.forEach(it => this.hits.push(new HitLocationDamage(it, this)))
	}

	hits: LocationDamage[] = []

	private overrides: ContainerOverrides = {
		armorDivisor: undefined,
		damagePool: undefined,
		damageReduction: undefined,
		damageType: undefined,
		injury: undefined,
		injuryTolerance: undefined,
		isExplosion: undefined,
		isHalfDamage: undefined,
		isInternalExplosion: undefined,
		isShotgunCloseRange: undefined,
		range: undefined,
		rofMultiplier: undefined,
		vulnerability: undefined,
	}

	get isOverridden(): boolean {
		if (Object.values(this.overrides).some(it => it !== undefined)) return true
		if (this.vulnerabilities.some(it => it.apply)) return true
		return this.hits.some(it => it.isOverridden)
	}

	resetOverrides(): void {
		let key: keyof ContainerOverrides
		for (key in this.overrides) {
			this.overrides[key] = undefined
		}

		for (const trait of this.vulnerabilities) {
			trait.apply = false
		}

		this.hits.forEach(it => it.resetOverrides())
	}

	private damageRoll: DamageRoll

	format: (stringId: string, data?: any) => string

	target: DamageTarget

	applyBasicDamage(index: number): void {
		const amount = this.hits[index].results.basicDamage!.value
		this.target.incrementDamage(amount, this.damagePoolID)
	}

	applyTotalDamage(): void {
		const amount = this.injury
		this.target.incrementDamage(amount, this.damagePoolID)
	}

	get injury(): number {
		return this.overrides.injury ? this.overrides.injury : this._injury
	}

	private get _injury(): number {
		return this.hits
			.map(it => it.results)
			.map(it => it.injury!.value)
			.reduce((acc, cur) => acc + cur, 0)
	}

	get injuryOverride(): number | undefined {
		return this.overrides.injury
	}

	set injuryOverride(value: number | undefined) {
		this.overrides.injury = this._injury === value ? undefined : value
	}

	// === Attacker ===

	get attacker(): DamageAttacker | undefined {
		return this.damageRoll.attacker
	}

	// === Weapon ===

	get weapon(): DamageWeapon | undefined {
		return this.damageRoll.weapon
	}

	get dice(): DiceGURPS {
		return this.damageRoll.dice
	}

	private get diceOfDamage(): number {
		return this.dice.count
	}

	// --- Damage Pool ---
	get damagePoolID(): string {
		if (this.overrides.damagePool) return this.overrides.damagePool
		return this.damageType.pool_id ?? "hp"
	}

	get damagePoolOverride(): string | undefined {
		return this.overrides.damagePool
	}

	set damagePoolOverride(value: string | undefined) {
		this.overrides.damagePool = this.damageType.pool_id === value ? undefined : value
	}

	get damagePools(): TargetPool[] {
		return this.target.pools
	}

	get damagePool(): TargetPool {
		return this.damagePools.find(it => it.id === this.damagePoolID)!
	}

	// --- Damage Type ---
	get damageType(): DamageType {
		return this.overrides.damageType ?? this.damageRoll.damageType
	}

	get damageTypeKey(): string {
		return this.overrides.damageType ? this.overrides.damageType.id : this.damageRoll.damageType.id
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

	get damageModifier(): string {
		return this.damageRoll.damageModifier
	}

	get isExplosion(): boolean {
		return this.overrides.isExplosion ?? this._hasExplosionModifier
	}

	private get _hasExplosionModifier(): boolean {
		return this.damageRoll.damageModifier === "ex"
	}

	get isExplosionOverride(): boolean | undefined {
		return this.overrides.isExplosion
	}

	set isExplosionOverride(value: boolean | undefined) {
		if (value) {
			this.overrides.isExplosion = true
			this.overrides.range = 0
		}
		this.overrides.isExplosion = this._hasExplosionModifier === value ? undefined : value
	}

	get isInternalExplosion(): boolean {
		return this.overrides.isInternalExplosion ?? this._isInternalExplosion
	}

	private get _isInternalExplosion(): boolean {
		return this.isExplosion && this.damageRoll.internalExplosion
	}

	get isInternalOverride(): boolean | undefined {
		return this.overrides.isInternalExplosion
	}

	set isInternalOverride(value: boolean | undefined) {
		this.overrides.isInternalExplosion = this._isInternalExplosion === value ? undefined : value
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

	private effectiveArmorDivisor(hardenedDRLevel: number): ExplainedValue {
		let ad = this.armorDivisor
		if (isArmorDivisorLimitation())
			return { value: ad, explanation: this.format("gurps.dmgcalc.description.armor_divisor", { divisor: ad }) }

		// B414: If an explosive attack has an armor divisor, it does not apply to the collateral damage.
		if (this.isCollateralDamage) {
			return { value: 1, explanation: this.format("gurps.dmgcalc.description.armor_divisor_collateral") }
		}

		const armorDivisors = [0, 100, 10, 5, 3, 2, 1]
		let index = armorDivisors.indexOf(ad)

		// B47: Each level of Hardened reduces the armor divisor of an attack by one step
		index += hardenedDRLevel
		if (index > armorDivisors.length - 1) index = armorDivisors.length - 1

		return {
			value: armorDivisors[index],
			explanation:
				hardenedDRLevel > 0
					? this.format("gurps.dmgcalc.description.hardened_dr", {
							divisor: ad,
							level: hardenedDRLevel,
						})
					: this.format("gurps.dmgcalc.description.armor_divisor", { divisor: armorDivisors[index] }),
		}

		function isArmorDivisorLimitation() {
			return ad > 0 && ad < 1
		}
	}

	// --- Range ---
	get range(): number | undefined {
		return this.overrides.range !== undefined ? this.overrides.range : this._calculateRange()
	}

	private _calculateRange(): number | undefined {
		const scenes = (globalThis as any).game?.scenes
		if (scenes) {
			const canvas = scenes.active
			const token1 = canvas!.tokens.get(this.attacker!.tokenId) as TokenDocumentGURPS & { x: number; y: number }
			const token2 = canvas!.tokens.get(this.target!.tokenId) as TokenDocumentGURPS & { x: number; y: number }

			const ruler = new Ruler() as Ruler & { totalDistance: number }
			ruler.waypoints = [{ x: token1.x, y: token1.y }]
			ruler.measure({ x: token2.x, y: token2.y }, { gridSpaces: true })
			const distance = ruler.totalDistance
			ruler.clear()
			return distance
		}
		return undefined
	}

	get rangeOverride(): number | undefined {
		return this.overrides.range
	}

	set rangeOverride(value: number | undefined) {
		this.overrides.range = value === this._calculateRange() ? undefined : value
	}

	// --- Half Damage ---
	get isHalfDamage(): boolean {
		return this.overrides.isHalfDamage === undefined ? this.damageRoll.isHalfDamage : this.overrides.isHalfDamage
	}

	get isHalfDamageOverride(): boolean | undefined {
		return this.overrides.isHalfDamage
	}

	set isHalfDamageOverride(value: boolean | undefined) {
		this.overrides.isHalfDamage = this.damageRoll.isHalfDamage === value ? undefined : value
	}

	// --- Shotgun ---
	get isShotgunCloseRange(): boolean {
		return this.overrides.isShotgunCloseRange === undefined
			? this.damageRoll.isShotgunCloseRange
			: this.overrides.isShotgunCloseRange
	}

	get isShotgunCloseRangeOverride(): boolean | undefined {
		return this.overrides.isShotgunCloseRange
	}

	set isShotgunCloseRangeOverride(value: boolean | undefined) {
		this.overrides.isShotgunCloseRange = this.damageRoll.isShotgunCloseRange === value ? undefined : value
	}

	private get multiplierForShotgun() {
		// B409:At ranges less than 10% of 1/2D, don’t apply the RoF multiplier to RoF.
		// Instead, multiply both basic damage dice and the target’s DR by half that value (round down).
		return this.isShotgunCloseRange ? Math.floor(this.rofMultiplier / 2) : 1
	}

	// --- RoF Multiplier ---
	get rofMultiplier(): number {
		return this.overrides.rofMultiplier ?? this.damageRoll.rofMultiplier
	}

	get rofMultiplierOverride(): number | undefined {
		return this.overrides.rofMultiplier
	}

	set rofMultiplierOverride(value: number | undefined) {
		this.overrides.rofMultiplier = this.damageRoll.rofMultiplier === value ? undefined : value
	}

	// === Target ===

	get hitLocationTable(): HitLocationTable {
		return this.target.hitLocationTable
	}

	get shockFactor(): number {
		return Math.floor(this.target.hitPoints.value / 10)
	}

	get hitLocationChoice(): Record<string, string> {
		const choice: Record<string, string> = {}
		this.hitLocationTable.locations.forEach(it => (choice[it.table_name] = it.table_name))
		return choice
	}

	/**
	 * @returns {number} the maximum injury based on Injury Tolerance, or Infinity.
	 */
	get maximumForInjuryTolerance(): ExplainedValue {
		if (this.isDiffuse) {
			if ([DamageTypes.imp, ...AnyPiercingType].includes(this.damageType))
				return { value: 1, explanation: this.format("gurps.dmgcalc.description.diffuse_max", { value: 1 }) }
			return { value: 2, explanation: this.format("gurps.dmgcalc.description.diffuse_max", { value: 2 }) }
		}
		return { value: Infinity, explanation: "" }
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
		// Find all traits with name "Vulnerability". Convert to a Vulnerability object.
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

	// --- Other Attack Properties ---
	get isTightBeamBurning(): boolean {
		return this.damageType === DamageTypes.burn && this.damageModifier === "tbb"
	}

	get isKnockbackOnly() {
		return this.damageType === DamageTypes.kb
	}

	private get isCollateralDamage(): boolean {
		return this.isExplosion && this.isAtRange
	}

	private get isAtRange(): boolean {
		return this.range != null && this.range > 0
	}

	// === Step Calculations ===

	getDamageResults(hitLocationDamage: HitLocationDamage): DamageResults {
		const results = new DamageResults()
		results.addResults(this.getBasicDamageSteps(hitLocationDamage))
		results.addResults(this.getDamageResistanceSteps(hitLocationDamage))
		results.addResults(this.getPenetratingDamageSteps(results.basicDamage!, results.damageResistance!))
		results.addResults(this.getWoundingModifierSteps(hitLocationDamage))
		// results.addResults(
		// 	this.getInjurySteps(hitLocationDamage, results.woundingModifier!.value, results.penetratingDamage!.value)
		// )
		return results
	}

	getBasicDamageSteps(hit: HitLocationDamage): (CalculatorStep | undefined)[] {
		const basicDamages: (CalculatorStep | undefined)[] = []

		basicDamages.push(new BasicDamageStep(hit.basicDamage, this.damagePool.name))
		basicDamages.push(this.adjustBasicDamage(hit.basicDamage))

		return basicDamages
	}

	addBasicDamageSteps(results: DamageResults, basicDamage: number): void {
		results.addResult(new BasicDamageStep(basicDamage, this.damagePool.name))
		results.addResult(this.adjustBasicDamage(basicDamage))
	}

	/**
	 * Add steps to adjust Basic Damage for explosion, knockback, half damage, and shotgun.
	 * @param basicDamage The basic damage value of the hitLocation.
	 * @returns  A CalculatorStep to add to the results.
	 */
	adjustBasicDamage(basicDamage: number): CalculatorStep | undefined {
		const isExplosion = this.isExplosion
		const range = this.range

		// B414: An explosion inflicts “collateral damage” on everything within (2 x dice of damage) yards.
		if (isExplosion && range) {
			if (outOfRange(this.diceOfDamage)) {
				return new AdjustedBasicDamageStep(0, this.format("gurps.dmgcalc.description.explosion_outofrange"))
			} else {
				return new AdjustedBasicDamageStep(
					Math.floor(basicDamage / (3 * range!)),
					this.format("gurps.dmgcalc.description.explosion_range", { range: range })
				)
			}
		}

		// B378: “Knockback Only”: Some attacks – a jet of water, a shove (p. 372), etc. – do knockback but no damage
		if (this.isKnockbackOnly)
			return new AdjustedBasicDamageStep(0, this.format("gurps.dmgcalc.description.knockback_only"))

		// B378: If the target is at or beyond 1/2D range, divide basic damage by 2, rounding down.
		if (this.isHalfDamage) {
			return new AdjustedBasicDamageStep(
				Math.floor(basicDamage * 0.5),
				this.format("gurps.dmgcalc.description.half_damage")
			)
		}

		// B409: At ranges less than 10% of 1/2D, don’t apply the RoF multiplier to RoF.
		// Instead, multiply both basic damage dice and the target’s DR by half that value (round down).
		if (this.multiplierForShotgun !== 1) {
			return new AdjustedBasicDamageStep(
				basicDamage * this.multiplierForShotgun,
				this.format("gurps.dmgcalc.description.shotgun", {
					multiplier: this.multiplierForShotgun,
				})
			)
		}

		return undefined

		function outOfRange(diceOfDamage: number) {
			return !range || range > diceOfDamage * 2
		}
	}

	getDamageResistanceSteps(hit: HitLocationDamage): (CalculatorStep | undefined)[] {
		const results: (CalculatorStep | undefined)[] = []

		const dr = this.damageResistanceAndReason(hit)
		results.push(new DamageResistanceStep(dr.value, dr.explanation))
		results.push(this.adjustDamageResistance(dr.value, hit))

		return results
	}

	/**
	 * Adds damage resistance steps to the results based on the given hitLocation.
	 * @param results - The damage results object.
	 * @param hitLocation - The damage to location object.
	 */
	addDamageResistanceSteps(results: DamageResults, hitLocation: LocationDamage): void {
		const dr = this.damageResistanceAndReason(hitLocation)
		results.addResult(new DamageResistanceStep(dr.value, dr.explanation))
		results.addResult(this.adjustDamageResistance(results.damageResistance!.value, hitLocation))
	}

	/**
	 * Calculates the damage resistance and reason for a given hitLocation.
	 * @param hitLocation The damage to location object.
	 * @returns An object containing the key and value of the damage resistance and reason.
	 */
	private damageResistanceAndReason(hitLocation: LocationDamage): ExplainedValue {
		if (hitLocation.damageResistanceOverride)
			return {
				explanation: this.format("gurps.dmgcalc.override"),
				value: hitLocation.damageResistanceOverride,
			}

		// B400: Large-Area Injury: “effective DR” is the average of your torso DR and the DR of the least protected hit
		// location exposed to the attack.
		if (hitLocation.isLargeAreaInjury) {
			// I'm only handling the simplest case: all hit locations are exposed to the attack.
			const averageDR = Math.floor(
				(torsoDR(this.hitLocationTable, this.damageType) +
					leastProtectedLocationDR(this.hitLocationTable, this.damageType)) /
					2
			)
			return { explanation: this.format("gurps.dmgcalc.description.large_area_injury"), value: averageDR }
		}

		return hitLocation.damageResistance

		function leastProtectedLocationDR(hitLocationTable: HitLocationTable, damageType: DamageType) {
			const allLocationsDR = hitLocationTable.locations
				.map(it => HitLocationUtil.getHitLocationDR(it, damageType))
				.filter(it => it !== -1)
			return Math.min(...allLocationsDR)
		}

		function torsoDR(hitLocationTable: HitLocationTable, damageType: DamageType) {
			const torso = HitLocationUtil.getHitLocation(hitLocationTable, Torso)
			return HitLocationUtil.getHitLocationDR(torso, damageType)
		}
	}

	/**
	 * Adjusts the damage resistance based on the given parameters.
	 * @param dr - The damage resistance value.
	 * @param hitLocation - The location damage.
	 * @returns A CalculatorStep object representing the adjusted damage resistance,
	 *          or undefined if no adjustment is needed.
	 */
	adjustDamageResistance(dr: number, hitLocation: LocationDamage): CalculatorStep | undefined {
		const effectiveArmorDivisor = this.effectiveArmorDivisor(hitLocation.hardenedDRLevel)
		// Armor Divisor is "Ignores DR"

		if (effectiveArmorDivisor.value === IgnoresDR) {
			return new EffectiveDamageResistanceStep(0, this.format("gurps.dmgcalc.description.armor_divisor_ignores"))
		}

		// B414: If an explosive goes off inside someone – e.g., a follow-up attack penetrates the target’s DR,
		// or a dragon swallows a hand grenade – DR has no effect!
		if (this.isInternalExplosion) {
			return new EffectiveDamageResistanceStep(0, this.format("gurps.dmgcalc.description.explosion_internal"))
		}

		if (this.damageType === DamageTypes.injury) {
			return new EffectiveDamageResistanceStep(0, this.format("gurps.dmgcalc.description.ignores_dr"))
		}

		// B409: At ranges less than 10% of 1/2D, don’t apply the RoF multiplier to RoF.
		// Instead, multiply both basic damage dice and the target’s DR by half that value (round down).
		if (this.multiplierForShotgun > 1) {
			return new EffectiveDamageResistanceStep(
				dr * this.multiplierForShotgun,
				this.format("gurps.dmgcalc.description.shotgun", { multiplier: this.multiplierForShotgun })
			)
		}

		if (effectiveArmorDivisor.value !== NoArmorDivisor) {
			// There are two cases: Armor Divisor WITH and WITHOUT Hardened Armor.
			return new EffectiveDamageResistanceStep(
				this.getEffectiveDR(dr, effectiveArmorDivisor.value),
				effectiveArmorDivisor.explanation
			)
		}

		return undefined
	}

	private getEffectiveDR(dr: number, effectiveArmorDivisor: number) {
		let result = Math.floor(dr / effectiveArmorDivisor)
		// B110: In addition, if you have any level of (Armor Divisor as a limitation), targets that have DR 0 (e.g.,
		// bare flesh) get DR 1 against your attack.
		return isArmorDivisorLimitation() ? Math.max(result, 1) : result

		function isArmorDivisorLimitation() {
			return effectiveArmorDivisor < 1
		}
	}

	getPenetratingDamageSteps(
		basicDamage: CalculatorStep,
		damageResistance: CalculatorStep
	): (CalculatorStep | undefined)[] {
		const penetrating = basicDamage!.value - damageResistance!.value
		return [
			new PenetratingDamageStep(Math.max(penetrating, 0), `= ${basicDamage!.value} – ${damageResistance!.value}`),
		]
	}

	/**
	 * Adds the steps for calculating penetrating damage to the given DamageResults object.
	 * B377: If your damage roll exceeds your target’s DR, the excess is the penetrating damage.
	 *
	 * @param results - The DamageResults object to add the penetrating damage steps to.
	 */
	addPenetratingDamageSteps(results: DamageResults): void {
		results.addResult(
			new PenetratingDamageStep(
				Math.max(results.basicDamage!.value - results.damageResistance!.value, 0),
				`= ${results.basicDamage!.value} – ${results.damageResistance!.value}`
			)
		)
	}

	getWoundingModifierSteps(hit: LocationDamage): (CalculatorStep | undefined)[] {
		const results: (CalculatorStep | undefined)[] = []

		const mod = this.woundingModifierAndReason(hit)
		const step1 = new WoundingModifierStep(mod.value, mod.explanation)
		results.push(step1)

		const step2 = this.adjustWoundingModifierForInjuryTolerance(mod.value, hit)
		results.push(step2)

		results.push(this.adjustWoundingModifierForVulnerabilities(step2?.value ?? step1.value))

		return results
	}

	/**
	 * Adds the wounding modifier steps to the damage results.
	 * @param results The damage results object.
	 * @param hitLocation The location damage object.
	 */
	addWoundingModifierSteps(results: DamageResults, hitLocation: LocationDamage): void {
		const mod = this.woundingModifierAndReason(hitLocation)
		results.addResult(new WoundingModifierStep(mod.value, mod.explanation))

		results.addResult(this.adjustWoundingModifierForInjuryTolerance(results.woundingModifier!.value, hitLocation))
		results.addResult(this.adjustWoundingModifierForVulnerabilities(results.woundingModifier!.value))
	}

	/**
	 *
	 * @param locationDamage
	 * @returns
	 */
	woundingModifierAndReason(locationDamage: LocationDamage): ExplainedValue {
		if (locationDamage.woundingModifierOverride)
			return {
				value: locationDamage.woundingModifierOverride,
				explanation: this.format("gurps.dmgcalc.override"),
			}

		if (this.woundingModifierByDamageType) return this.woundingModifierByDamageType

		const modifierAndReason = this.woundingModifierByHitLocation(locationDamage.locationName!)
		if (modifierAndReason) return modifierAndReason

		const location = this.hitLocationTable.locations.find(it => it.table_name === locationDamage.locationName)
		return {
			value: this.damageType.woundingModifier,
			explanation: this.format("gurps.dmgcalc.description.damage_location", {
				type: this.format(this.damageType.full_name),
				location: location?.table_name,
			}),
		}
	}

	get woundingModifierByDamageType(): ExplainedValue | undefined {
		// B398: Fatigue damage always ignores hit location.
		if (this.damageType === DamageTypes.fat)
			return { value: 1, explanation: this.format("gurps.dmgcalc.description.fatigue") }

		if (this.isInternalExplosion)
			return { value: 3, explanation: this.format("gurps.dmgcalc.description.explosion_internal") }
		return undefined
	}

	/**
	 * Adjusts the wounding modifier for injury tolerance.
	 * @param woundingModifier - The original wounding modifier.
	 * @param locationDamage - The location damage.
	 * @returns The calculator step if the wounding modifier is adjusted, otherwise undefined.
	 */
	private adjustWoundingModifierForInjuryTolerance(
		woundingModifier: number,
		locationDamage: LocationDamage
	): CalculatorStep | undefined {
		let mod = undefined

		// B380: Homogenous: Things that lack vulnerable internal parts or mechanisms – such as uniformly solid or
		// hollow objects, unpowered vehicles, trees, and walls – are even less vulnerable!
		if (this.isHomogenous)
			mod = { value: this.damageType.homogenous, key: this.format("gurps.dmgcalc.tolerance.homogenous") }

		const location = this.hitLocationTable.locations.find(it => it.table_name === locationDamage.locationName)

		// B380: Unliving: Machines and anyone with Injury Tolerance (Unliving) (p. 60), such as most corporeal
		// undead, are less vulnerable to impaling and piercing damage.
		// B400: Hit location has its usual effect, save that piercing and impaling damage to any location other than
		// the eye, skull, or vitals uses the Unliving wounding modifiers.
		if (location && this.isUnliving && !["skull", "eye", "vitals"].includes(location.id))
			mod = { value: this.damageType.unliving, key: this.format("gurps.dmgcalc.tolerance.unliving") }

		// B400: No Brain: Hits to the skull get no extra knockdown or wounding modifier. Hits to the eye can cripple
		// the eye; otherwise, treat them as face hits, not skull hits.
		if (location && this.target.hasTrait("No Brain") && ["skull", "eye"].includes(location.id!))
			mod = { value: this.damageType.woundingModifier, key: this.format("gurps.dmgcalc.description.no_brain") }

		/**
		 * TODO Diffuse: Exception: Area-effect, cone, and explosion attacks cause normal injury.
		 */
		// B400: Diffuse: Ignore all knockdown or wounding modifiers for hit location.
		if (this.isDiffuse && this.woundingModifierByHitLocation(locationDamage.locationName!)) {
			mod = { value: this.damageType.woundingModifier, key: this.format("gurps.dmgcalc.description.diffuse") }
		}

		if (mod && mod.value !== woundingModifier) {
			return new InjuryToleranceStep(mod.value, mod.key)
		}

		return undefined
	}

	/**
	 * @returns {number} wounding modifier only based on hit location.
	 */
	woundingModifierByHitLocation(locationName: string): ExplainedValue | undefined {
		const location = this.hitLocationTable.locations.find(it => it.table_name === locationName)

		const standardMessage = this.format("gurps.dmgcalc.description.damage_location", {
			type: this.format(`gurps.dmgcalc.type.${this.damageType.id}`),
			location: location?.table_name,
		})

		if (!location) return undefined

		switch (location.id) {
			case "vitals":
				// B399: Increase the wounding modifier for an impaling or any piercing attack to x3...
				if ([DamageTypes.imp, ...AnyPiercingType].includes(this.damageType))
					return { value: 3, explanation: standardMessage }
				if (this.isTightBeamBurning)
					// ...Increase the  wounding modifier for a tight-beam burning attack (see box) to x2.
					return {
						value: 2,
						explanation: this.format("gurps.dmgcalc.description.tight_beam_burn", {
							location: location?.table_name,
						}),
					}
				break

			case "skull":
			case "eye":
				// B399: The wounding modifier for all attacks (to the skull) increases to x4. Treat (eye hits) as a
				// skull hit. Exception: None of these effects apply to toxic damage.
				if (this.damageType !== DamageTypes.tox) return { value: 4, explanation: standardMessage }
				break

			case "face":
				// B399: Corrosion damage (to the face) (only) gets a x1.5 wounding modifier.
				if (this.damageType === DamageTypes.cor) return { value: 1.5, explanation: standardMessage }
				break

			case "neck":
				// B399: Increase the wounding multiplier of crushing and corrosion attacks to x1.5, and that of cutting
				// damage to x2.
				if ([DamageTypes.cor, DamageTypes.cr].includes(this.damageType))
					return { value: 1.5, explanation: standardMessage }
				if (this.damageType === DamageTypes.cut) return { value: 2, explanation: standardMessage }
				break

			case "hand":
			case "foot":
			case "arm":
			case "leg":
				// B399: Arm or Leg ... reduce the wounding multiplier of large piercing, huge piercing, and impaling
				// damage to x1. Hands or Feet ... As for an arm or leg.
				if ([DamageTypes["pi+"], DamageTypes["pi++"], DamageTypes.imp].includes(this.damageType))
					return { value: 1, explanation: standardMessage }
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
		if (this.vulnerabilityLevel !== NotVulnerable) {
			// B161: You take extra damage from a particular attack form. Whenever this type of attack hits you,
			// the GM applies a special wounding multiplier to damage that penetrates your DR. Regular wounding
			// multipliers (for cutting, impaling, etc.) further multiply the damage.
			return new EffectiveWoundingModifieStep(
				woundingModifier * this.vulnerabilityLevel,
				this.format("gurps.dmgcalc.description.vulnerability", {
					modifier: formatFraction(woundingModifier),
					vulnerability: this.vulnerabilityLevel,
				})
			)
		}

		return undefined
	}

	addInjurySteps(results: DamageResults, hitlocation: HitLocationDamage): void {
		let value = Math.floor(results.woundingModifier!.value * results.penetratingDamage!.value)
		if (results.woundingModifier!.value !== 0 && value === 0 && results.penetratingDamage!.value > 0) value = 1
		results.addResult(
			new InjuryStep(
				value,
				`= ${results.penetratingDamage!.value} × ${formatFraction(results.woundingModifier!.value)}`
			)
		)
		this.adjustInjury(results, hitlocation)

		// Adjust for Damage Reduction.
		if (this.damageReduction !== NoDamageReduction) {
			const newValue = Math.ceil(results.injury!.value / this.damageReduction)
			results.addResult(
				new DamageReductionStep(
					newValue,
					this.format("gurps.dmgcalc.description.damage_reduction", {
						injury: results.injury!.value,
						reduction: this.damageReduction,
					})
				)
			)
		}

		// Adjust for hit location.
		const maxResult = hitlocation.maximumInjury(this.target.hitPoints.value)
		const newValue = Math.min(results.injury!.value, maxResult.value)
		if (newValue < results.injury!.value) {
			results.addResult(new MaxForLocationStep(newValue, maxResult.explanation))
		}
	}

	adjustInjury(results: DamageResults, hitlocation: HitLocationDamage): void {
		const STEP = "gurps.dmgcalc.substep.adjusted_injury"

		// Adjust for Injury Tolerance. This must be before Hit Location or Trauma.
		const maximumForInjuryTolerance = this.maximumForInjuryTolerance
		let newValue = Math.min(results.injury!.value, maximumForInjuryTolerance.value)
		if (newValue < results.injury!.value) {
			results.addResult(new AdjustedInjuryStep(newValue, maximumForInjuryTolerance.explanation))
		}

		if (this.isDiffuse) return

		// Adjust for blunt trauma.
		if (this.isBluntTrauma(results, hitlocation)) {
			results.addResult(
				new AdjustedInjuryStep(this.bluntTrauma(results), this.format("gurps.dmgcalc.description.blunt_trauma"))
			)
		}
	}

	/**
	 * @returns {number} the amount of blunt trauma damage, if any.
	 */
	private bluntTrauma(results: DamageResults): number {
		// No need to do this check -- this method is only called if isBluntTrauma is true.
		// if (results.penetratingDamage!.value > 0 || !this.isFlexibleArmor) return 0
		return this.damageType.bluntTraumaDivisor > 0
			? Math.floor(results.basicDamage!.value / this.damageType.bluntTraumaDivisor)
			: 0
	}

	private isBluntTrauma(results: DamageResults, hitLocation: HitLocationDamage): boolean {
		return (
			hitLocation.isFlexibleArmor &&
			results.penetratingDamage!.value === 0 &&
			this.damageType.bluntTraumaDivisor > 1 &&
			this.bluntTrauma(results) > 0
		)
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

	private format(arg0: string, data?: any): string {
		return this.calculator.format(arg0, data)
	}

	calculator: DamageCalculator

	hit: DamageHit

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
		locationName: undefined,
		rawDR: undefined,
		woundingModifier: undefined,
	}

	resetOverrides() {
		let key: keyof Overrides
		for (key in this.overrides) {
			this.overrides[key] = undefined
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
		this.calculator.addInjurySteps(results, this)

		results.knockback = this.knockback(results)
		results.addEffects(this.knockbackEffects(results.knockback))
		results.addEffects(this.shockEffects(results))
		results.addEffects(this.majorWoundEffects(results))
		results.addEffects(this.miscellaneousEffects(results))
		return results
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

	// --- Wounding Modifier ---
	// TODO Move this to DamageCalculator
	get woundingModifier(): number {
		let woundingModifier = 1

		if (this.overrides.woundingModifier) {
			woundingModifier = this.overrides.woundingModifier
		} else if (this.calculator.woundingModifierByDamageType) {
			const modifier = this.calculator.woundingModifierByDamageType
			woundingModifier = modifier.value
		} else if (this.calculator.woundingModifierByHitLocation(this.locationName)) {
			const modifier = this.calculator.woundingModifierByHitLocation(this.locationName)
			woundingModifier = modifier ? modifier.value : 1
		} else {
			woundingModifier = this.calculator.damageType.woundingModifier
		}
		return woundingModifier
	}

	get woundingModifierOverride(): number | undefined {
		return this.overrides.woundingModifier
	}

	set woundingModifierOverride(value: number | undefined) {
		this.overrides.woundingModifier = this.woundingModifier === value ? undefined : value
	}

	// --- Hit Location ---
	get locationName(): string {
		return this.overrides.locationName ?? this.hit.locationId
	}

	get locationNameOverride(): string | undefined {
		return this.overrides.locationName
	}

	set locationNameOverride(value: string | undefined) {
		this.overrides.locationName = this.hit.locationId === value ? undefined : value
	}

	get hitLocation(): HitLocation | undefined {
		return this.calculator.hitLocationTable.locations.find(it => it.table_name === this.locationName)
	}

	get isLargeAreaInjury(): boolean {
		return this.locationName === DefaultHitLocations.LargeArea
	}

	// --- Damage Resistance ---
	get damageResistance(): ExplainedValue {
		return {
			explanation: `${this.hitLocation?.table_name}`,
			value:
				this.overrides.rawDR ?? HitLocationUtil.getHitLocationDR(this.hitLocation, this.calculator.damageType),
		}
	}

	set damageResistanceOverride(dr: number | undefined) {
		this.overrides.rawDR =
			HitLocationUtil.getHitLocationDR(this.hitLocation, this.calculator.damageType) === dr ? undefined : dr
	}

	get damageResistanceOverride() {
		return this.overrides.rawDR
	}

	// --- Flexible Armor ---
	get isFlexibleArmor(): boolean {
		return this.overrides.flexible === undefined ? this._isFlexibleArmor : this.overrides.flexible
	}

	get _isFlexibleArmor(): boolean {
		const hitLocation = HitLocationUtil.getHitLocation(this.calculator.hitLocationTable, this.locationName)
		return HitLocationUtil.isFlexibleArmor(hitLocation)
	}

	get flexibleArmorOverride(): boolean | undefined {
		return this.overrides.flexible
	}

	set flexibleArmorOverride(value: boolean | undefined) {
		this.overrides.flexible = this._isFlexibleArmor === value ? undefined : value
	}

	// --- Hardened DR ---
	get hardenedDRLevel(): number {
		return this.overrides.hardenedDR ?? this._hardenedDRLevel
	}

	private get _hardenedDRLevel(): number {
		return this.calculator.target.getTrait("Damage Resistance")?.getModifier("Hardened")?.levels ?? 0
	}

	get hardenedDROverride(): number | undefined {
		return this.overrides.hardenedDR
	}

	set hardenedDROverride(level: number | undefined) {
		this.overrides.hardenedDR = this._hardenedDRLevel === level ? undefined : level
	}

	/**
	 * @returns the maximum injury based on hit location, or Infinity if none.
	 */
	maximumInjury(maxHitPoints: number): ExplainedValue {
		const location = this.calculator.hitLocationTable.locations.find(it => it.table_name === this.locationName)

		if (location && Limb.includes(location.id)) {
			const max = Math.floor(maxHitPoints / 2) + 1
			return {
				value: max,
				explanation: this.format("gurps.dmgcalc.description.location_max", {
					location: location?.table_name,
				}),
			}
		}

		if (location && Extremity.includes(location.id)) {
			const max = Math.floor(maxHitPoints / 3) + 1
			return {
				value: max,
				explanation: this.format("gurps.dmgcalc.description.location_max", {
					location: location?.table_name,
				}),
			}
		}

		return { value: Infinity, explanation: "" }
	}

	/**
	 * @returns {number} yards of knockback, if any.
	 */
	private knockback(results: DamageResults): number {
		if (this.isDamageTypeKnockbackEligible) {
			if (this.calculator.damageType === DamageTypes.cut && results.penetratingDamage!.value > 0) return 0

			// console.log(results)
			return Math.floor(results.rawDamage!.value / (this.knockbackResistance - 2))
		}
		return 0
	}

	private get isDamageTypeKnockbackEligible() {
		return [DamageTypes.cr, DamageTypes.cut, DamageTypes.kb].includes(this.calculator.damageType)
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
			const location = this.calculator.hitLocationTable.locations.find(it => it.table_name === this.locationName)
			if (
				this.calculator.damageType === DamageTypes.cr &&
				location?.id === "groin" &&
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
		if (
			this.calculator.damageType === DamageTypes.fat ||
			this.calculator.isHomogenous ||
			this.calculator.isDiffuse
		) {
			if (this.isMajorWound(results))
				wounds.push(new InjuryEffect(InjuryEffectType.majorWound, [], [new KnockdownCheck()]))
		} else {
			const location = this.calculator.hitLocationTable.locations.find(it => it.table_name === this.locationName)
			switch (location?.id) {
				case "torso":
					if (this.isMajorWound(results))
						wounds.push(new InjuryEffect(InjuryEffectType.majorWound, [], [new KnockdownCheck()]))
					break

				case "skull":
				case "eye":
					if (results.shockEffects.length > 0 || this.isMajorWound(results)) {
						let penalty =
							this.calculator.damageType !== DamageTypes.tox &&
							!this.calculator.target.hasTrait("No Brain")
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
		const location = this.calculator.hitLocationTable.locations.find(it => it.table_name === this.locationName)
		let divisor = location && Extremity.includes(location.id) ? 3 : 2
		return results.injury!.value > this.calculator.target.hitPoints.value / divisor
	}

	private miscellaneousEffects(results: DamageResults): InjuryEffect[] {
		const location = this.calculator.hitLocationTable.locations.find(it => it.table_name === this.locationName)

		if (location && location.id === "eye" && results.injury!.value > this.calculator.target.hitPoints.value / 10)
			return [new InjuryEffect(InjuryEffectType.eyeBlinded)]

		if (location && location.id === "face" && this.isMajorWound(results)) {
			return results.injury!.value > this.calculator.target.hitPoints.value
				? [new InjuryEffect(InjuryEffectType.blinded)]
				: [new InjuryEffect(InjuryEffectType.eyeBlinded)]
		}

		if (location && Limb.includes(location.id) && this.isMajorWound(results)) {
			return [new InjuryEffect(InjuryEffectType.limbCrippled)]
		}

		if (location && Extremity.includes(location.id) && this.isMajorWound(results)) {
			return [new InjuryEffect(InjuryEffectType.limbCrippled)]
		}

		return []
	}
}

type StepName = "Basic Damage" | "Damage Resistance" | "Penetrating Damage" | "Wounding Modifier" | "Injury"

type ExplainedValue = { value: number; explanation: string }

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

class BasicDamageStep extends CalculatorStep {
	constructor(value: number, notes: string | undefined) {
		super("Basic Damage", "gurps.dmgcalc.substep.basic_damage", value, undefined, notes)
	}
}

class AdjustedBasicDamageStep extends CalculatorStep {
	constructor(value: number, notes: string | undefined) {
		super("Basic Damage", "gurps.dmgcalc.substep.adjusted_damage", value, undefined, notes)
	}
}

class DamageResistanceStep extends CalculatorStep {
	constructor(value: number, notes: string | undefined) {
		super("Damage Resistance", "gurps.dmgcalc.substep.damage_resistance", value, undefined, notes)
	}
}

class EffectiveDamageResistanceStep extends CalculatorStep {
	constructor(value: number, notes: string | undefined) {
		super("Damage Resistance", "gurps.dmgcalc.substep.effective_dr", value, undefined, notes)
	}
}

class PenetratingDamageStep extends CalculatorStep {
	constructor(value: number, notes: string | undefined) {
		super("Penetrating Damage", "gurps.dmgcalc.substep.penetrating", value, undefined, notes)
	}
}

class WoundingModifierStep extends CalculatorStep {
	constructor(value: number, notes: string | undefined) {
		super("Wounding Modifier", "gurps.dmgcalc.substep.wounding_modifier", value, `×${formatFraction(value)}`, notes)
	}
}

class InjuryToleranceStep extends CalculatorStep {
	constructor(value: number, notes: string | undefined) {
		super("Wounding Modifier", "gurps.dmgcalc.substep.injury_tolerance", value, `×${formatFraction(value)}`, notes)
	}
}

class EffectiveWoundingModifieStep extends CalculatorStep {
	constructor(value: number, notes: string | undefined) {
		super(
			"Wounding Modifier",
			"gurps.dmgcalc.substep.effective_modifier",
			value,
			`×${formatFraction(value)}`,
			notes
		)
	}
}

class InjuryStep extends CalculatorStep {
	constructor(value: number, notes: string | undefined) {
		super("Injury", "gurps.dmgcalc.substep.injury", value, undefined, notes)
	}
}

class AdjustedInjuryStep extends CalculatorStep {
	constructor(value: number, notes: string | undefined) {
		super("Injury", "gurps.dmgcalc.substep.adjusted_injury", value, undefined, notes)
	}
}

class DamageReductionStep extends CalculatorStep {
	constructor(value: number, notes: string | undefined) {
		super("Injury", "gurps.dmgcalc.substep.damage_reduction", value, undefined, notes)
	}
}

class MaxForLocationStep extends CalculatorStep {
	constructor(value: number, notes: string | undefined) {
		super("Injury", "gurps.dmgcalc.substep.max_location", value, undefined, notes)
	}
}

export class DamageResults {
	steps = <Array<CalculatorStep>>[]

	knockback = 0

	effects = <Array<InjuryEffect>>[]

	addResult(result: CalculatorStep | undefined) {
		if (result) this.steps.push(result)
	}

	addResults(results: (CalculatorStep | undefined)[]) {
		results.forEach(it => this.addResult(it))
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
		return [...this.steps].reverse()
	}
}

type Overrides = {
	locationName: string | undefined
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
	injury: number | undefined
	injuryTolerance: string | undefined
	isExplosion: boolean | undefined
	isHalfDamage: boolean | undefined
	isInternalExplosion: boolean | undefined
	isShotgunCloseRange: boolean | undefined
	range: number | undefined
	rofMultiplier: number | undefined
	vulnerability: number | undefined
}
