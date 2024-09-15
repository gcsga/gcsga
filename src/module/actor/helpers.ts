// import {
// 	DamageAttacker,
// 	DamageTarget,
// 	DamageWeapon,
// 	HitPointsCalc,
// 	TargetPool,
// 	TargetTrait,
// } from "@module/apps/damage-calculator/index.ts"
// import { AttributeGURPS, AttributeSchema, BodyGURPS, WeaponBonus } from "@system"
// import { Int, TooltipGURPS, attribute } from "@util"
// import type { ActorGURPS } from "./base/document.ts"
// import { MeleeWeaponGURPS, RangedWeaponGURPS } from "@item"
// import { ActorType, ItemType } from "@module/data/constants.ts"
// import { TraitAdapter } from "@item/helpers.ts"
//
// function addWeaponBonusToSet(
// 	bonus: WeaponBonus,
// 	dieCount: number,
// 	tooltip: TooltipGURPS | null = null,
// 	set: Set<WeaponBonus> = new Set(),
// ): void {
// 	// const savedLevel = bonus.leveledAmount.level
// 	const savedLevel = bonus.featureLevel
// 	// const savedDieCount = bonus.leveledAmount.dieCount
// 	const savedDieCount = bonus.dieCount
// 	// bonus.leveledAmount.dieCount = Int.from(dieCount)
// 	bonus.dieCount = Int.from(dieCount)
// 	// bonus.leveledAmount.level = bonus.derivedLevel
// 	bonus.featureLevel = bonus.derivedLevel
// 	bonus.addToTooltip(tooltip)
// 	// bonus.leveledAmount.level = savedLevel
// 	bonus.featureLevel = savedLevel
// 	// bonus.leveledAmount.dieCount = savedDieCount
// 	bonus.dieCount = savedDieCount
// 	set.add(bonus)
// }
//
// class DamageTargetActor<TActor extends ActorGURPS> implements DamageTarget {
// 	static DamageReduction = "Damage Reduction"
//
// 	private actor: TActor
//
// 	constructor(actor: TActor) {
// 		this.actor = actor
// 	}
//
// 	get tokenId(): string {
// 		let result = ""
// 		if (game.scenes?.active?.tokens) {
// 			result = game.scenes.active.tokens.find(it => it.actorId === this.actor.id)?.id ?? ""
// 		}
// 		return result as string
// 	}
//
// 	incrementDamage(delta: number, damagePoolId: string): void {
// 		const attributes: ModelPropsFromSchema<AttributeSchema>[] = []
// 		if (this.actor.isOfType(ActorType.Character)) {
// 			attributes.push(...this.actor.system.attributes)
// 		}
// 		const index = attributes.findIndex(it => it.id === damagePoolId)
// 		attributes[index].damage = attributes[index].damage! + delta
// 		this.actor.update({
// 			"system.attributes": attributes,
// 		})
// 	}
//
// 	get name(): string {
// 		return this.actor.name ?? ""
// 	}
//
// 	get ST(): number {
// 		return this.getSyntheticAttribute("st")?.calc.value ?? 0
// 	}
//
// 	get hitPoints(): HitPointsCalc {
// 		return this.getSyntheticAttribute("hp")!.calc
// 	}
//
// 	get hitLocationTable(): BodyGURPS {
// 		if (this.actor.isOfType(ActorType.Character)) {
// 			return this.actor.hitLocationTable
// 		}
// 		return new BodyGURPS(this.actor)
// 	}
//
// 	addDRBonusesFor(
// 		_locationID: string,
// 		_tooltip: TooltipGURPS | null = null,
// 		drMap: Map<string, number> = new Map(),
// 	): Map<string, number> {
// 		return drMap
// 	}
//
// 	/**
// 	 * This is my sneaky way to make dynamic and static actor attributes look the same. Most of my logic uses the calc
// 	 * property, but I don't want to have to add that to all the static attributes. So, if the attribute doesn't have
// 	 * a calc property, I'll add one. This is a bit of a hack, but it works.
// 	 * @param name
// 	 * @returns an object with a calc property containing the current and max values.
// 	 */
// 	private getSyntheticAttribute(name: string):
// 		| (AttributeGURPS & {
// 				calc: { value: number; current: number }
// 		  })
// 		| undefined {
// 		if (!this.actor.isOfType(ActorType.Character)) return undefined
// 		const attr = this.actor.attributes.get(name)
// 		if (!attr) return undefined
// 		return fu.mergeObject(attr, {
// 			calc: {
// 				value: attr.max,
// 				current: attr.current,
// 			},
// 		})
// 	}
//
// 	/**
// 	 * @returns the FIRST trait we find with the given name.
// 	 *
// 	 * This is where we would add special handling to look for traits under different names.
// 	 *  Actor
// 	 *  .tpraits.contents.find(it => it.name === 'Damage Resistance')
// 	 *	 .modifiers.contents.filter(it => it.enabled === true).find(it => it.name === 'Hardened')
// 	 * @param name
// 	 */
// 	getTrait(name: string): TargetTrait | undefined {
// 		if (!this.actor) return undefined
// 		const traits = this.actor.itemTypes[ItemType.Trait]
// 		const found = traits.find(it => it.name === name)
// 		return found ? new TraitAdapter(found) : undefined
// 	}
//
// 	/**
// 	 *
// 	 * @param name
// 	 * @returns all traits with the given name.
// 	 */
// 	getTraits(name: string): TargetTrait[] {
// 		if (!this.actor) return []
// 		const traits = this.actor.itemTypes[ItemType.Trait]
// 		return traits.filter(it => it.name === name).map(it => new TraitAdapter(it))
// 	}
//
// 	hasTrait(name: string): boolean {
// 		return !!this.getTrait(name)
// 	}
//
// 	private get isUnliving(): boolean {
// 		// Try "Injury Tolerance (Unliving)" and "Unliving"
// 		if (this.hasTrait("Unliving")) return true
// 		if (!this.hasTrait("Injury Tolerance")) return false
// 		const trait = this.getTrait("Injury Tolerance")
// 		return !!trait?.getModifier("Unliving")
// 	}
//
// 	private get isHomogenous(): boolean {
// 		if (this.hasTrait("Homogenous")) return true
// 		if (!this.hasTrait("Injury Tolerance")) return false
// 		const trait = this.getTrait("Injury Tolerance")
// 		return !!trait?.getModifier("Homogenous")
// 	}
//
// 	private get isDiffuse(): boolean {
// 		if (this.hasTrait("Diffuse")) return true
// 		if (!this.hasTrait("Injury Tolerance")) return false
// 		const trait = this.getTrait("Injury Tolerance")
// 		return !!trait?.getModifier("Diffuse")
// 	}
//
// 	get injuryTolerance(): "None" | "Unliving" | "Homogenous" | "Diffuse" {
// 		if (this.isDiffuse) return "Diffuse"
// 		if (this.isHomogenous) return "Homogenous"
// 		if (this.isUnliving) return "Unliving"
// 		return "None"
// 	}
//
// 	get pools(): TargetPool[] {
// 		if (!this.actor.isOfType(ActorType.Character)) return []
// 		return [...this.actor.attributes.values()]
// 			.filter(att => att.definition && att.definition.type === attribute.Type.Pool)
// 			.map(
// 				att =>
// 					<TargetPool>{
// 						id: att.definition!.id,
// 						name: att.definition!.name,
// 						fullName: att.definition!.fullName,
// 					},
// 			)
// 	}
// }
//
// class DamageAttackerAdapter<TActor extends ActorGURPS> implements DamageAttacker {
// 	private actor: TActor
//
// 	constructor(actor: TActor) {
// 		this.actor = actor
// 	}
//
// 	get tokenId(): string {
// 		let result = ""
// 		if (game.scenes?.active?.tokens) {
// 			result = game.scenes.active.tokens.find(it => it.actorId === this.actor.id)?.id ?? ""
// 		}
// 		return result
// 	}
//
// 	get name(): string | null {
// 		return this.actor.name
// 	}
// }
//
// class DamageWeaponAdapter implements DamageWeapon {
// 	base: MeleeWeaponGURPS | RangedWeaponGURPS | undefined
//
// 	constructor(base: MeleeWeaponGURPS | RangedWeaponGURPS) {
// 		this.base = base
// 	}
//
// 	get name(): string {
// 		return `${this.base?.container?.name} (${this.base?.name})`
// 	}
//
// 	get damageDice(): string {
// 		return this.base?.damage.current ?? ""
// 	}
// }
//
// export { addWeaponBonusToSet, DamageAttackerAdapter, DamageWeaponAdapter, DamageTargetActor }
