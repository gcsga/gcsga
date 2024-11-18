// import { AbstractWeaponTemplate } from "../templates/index.ts"
// import { WeaponField } from "./weapon-field.ts"
// import fields = foundry.data.fields
// import { Int, StringBuilder, TooltipGURPS, feature, progression, stdmg } from "@util"
// import { ActorType, ItemType, gid } from "@module/data/constants.ts"
// import { DiceGURPS, DiceSchema } from "@module/data/dice.ts"
// import { SheetSettings } from "@module/data/sheet-settings.ts"
// import { DiceField } from "./dice-field.ts"
// import { ToggleableBooleanField, ToggleableNumberField, ToggleableStringField } from "@module/data/fields/index.ts"
//
// class WeaponDamage extends WeaponField<AbstractWeaponTemplate, WeaponDamageSchema> {
// 	static override defineSchema(): WeaponDamageSchema {
// 		return {
// 			type: new ToggleableStringField({ required: true, nullable: false, initial: "cr" }),
// 			st: new ToggleableStringField({
// 				required: true,
// 				nullable: false,
// 				choices: stdmg.OptionsChoices,
// 				initial: stdmg.Option.Thrust,
// 			}),
// 			leveled: new ToggleableBooleanField({ required: true, nullable: false, initial: false }),
// 			st_mul: new ToggleableNumberField({ required: true, nullable: false, initial: 0 }),
// 			base: new DiceField(),
// 			armor_divisor: new ToggleableNumberField({ required: true, nullable: false, initial: 1 }),
// 			fragmentation: new DiceField(),
// 			fragmentation_armor_divisor: new ToggleableNumberField({ required: true, nullable: false, initial: 1 }),
// 			fragmentation_type: new ToggleableStringField({ required: true, nullable: false, initial: "" }),
// 			modifier_per_die: new ToggleableNumberField({ required: true, nullable: false, initial: 0 }),
// 		}
// 	}
//
// 	override toString(): string {
// 		const buffer = new StringBuilder()
// 		if (this.st !== stdmg.Option.None) {
// 			if (this.leveled) buffer.push(stdmg.Option.toStringLeveled(this.st))
// 			else buffer.push(game.i18n.localize(stdmg.Option.toString(this.st)))
// 		}
// 		let convertMods = false
// 		if (this.parent !== null) convertMods = SheetSettings.for(this.parent.actor).use_modifying_dice_plus_adds
// 		if (this.base !== null) {
// 			const base = this.base.stringExtra(convertMods)
// 			if (base !== "0") {
// 				if (buffer.length !== 0 && base[0] !== "+" && base[0] !== "-") {
// 					buffer.push("+")
// 				}
// 				buffer.push(base)
// 			}
// 		}
// 		if (this.armor_divisor !== 1) {
// 			buffer.push(`(${this.armor_divisor})`)
// 		}
// 		if (this.modifier_per_die !== 0) {
// 			if (buffer.length !== 0) buffer.push(" ")
// 			buffer.push(
// 				game.i18n.format("GURPS.Weapon.ModifierPerDie", {
// 					value: this.modifier_per_die.signedString(),
// 				}),
// 			)
// 		}
// 		const t = this.type.trim()
// 		if (t !== "") {
// 			buffer.push(" ", t)
// 		}
// 		if (this.fragmentation !== null) {
// 			const frag = this.fragmentation.stringExtra(convertMods)
// 			if (frag !== "0") {
// 				buffer.push(" [", frag)
// 				if (this.fragmentation_armor_divisor !== 1) buffer.push(`(${this.fragmentation_armor_divisor})`)
// 				buffer.push(` ${this.fragmentation_type}]`)
// 			}
// 		}
// 		return buffer.toString().trim()
// 	}
//
// 	override tooltip(_w: AbstractWeaponTemplate): string {
// 		const tooltip = new TooltipGURPS()
// 		this.resolvedValue(tooltip)
// 		if (tooltip.length !== 0) return game.i18n.localize("GURPS.Messages.NoAdditionalModifiers")
// 		return game.i18n.localize("GURPS.Messages.IncludesModifiersFrom") + tooltip.toString()
// 	}
//
// 	resolvedValue(tooltip: TooltipGURPS | null): string {
// 		let base = this.baseDamageDice
// 		if (base.count === 0 && base.modifier === 0) return this.toString()
// 		const actor = this.parent.actor
// 		if (actor === null || !actor.isOfType(ActorType.Character)) return this.toString()
//
// 		const adjustForPhoenixFlame =
// 			actor.system.settings.damage_progression === progression.Option.PhoenixFlameD3 && base.sides === 3
// 		let [percentDamageBonus, percentDRDivisorBonus] = [0, 0]
// 		let armorDivisor = this.armor_divisor
// 		for (const bonus of this.parent.collectWeaponBonuses(
// 			base.count,
// 			tooltip,
// 			feature.Type.WeaponBonus,
// 			feature.Type.WeaponDRDivisorBonus,
// 		)) {
// 			switch (bonus.type) {
// 				case feature.Type.WeaponBonus: {
// 					bonus.dieCount = base.count
// 					let amt = bonus.adjustedAmountForWeapon(this.parent)
// 					if (bonus.percent) percentDamageBonus += amt
// 					else {
// 						if (adjustForPhoenixFlame) {
// 							if (bonus.per_level) amt /= 2
// 							if (bonus.per_die) amt /= 2
// 						}
// 						base.modifier += amt
// 					}
// 					break
// 				}
// 				case feature.Type.WeaponDRDivisorBonus: {
// 					const amt = bonus.adjustedAmountForWeapon(this.parent)
// 					if (bonus.percent) percentDRDivisorBonus += amt
// 					else armorDivisor += amt
// 				}
// 			}
// 		}
// 		if (this.modifier_per_die !== 0) {
// 			let amt = this.modifier_per_die * base.count
// 			if (adjustForPhoenixFlame) amt /= 2
// 			base.modifier += amt
// 		}
// 		if (percentDamageBonus !== 0) base = adjustDiceForPercentBonus(base, percentDamageBonus)
// 		if (percentDRDivisorBonus !== 0) armorDivisor = Int.from((armorDivisor * percentDRDivisorBonus) / 100)
//
// 		const buffer = new StringBuilder()
// 		if (base.count !== 0 || base.modifier !== 0) {
// 			buffer.push(base.stringExtra(actor.system.settings.use_modifying_dice_plus_adds))
// 		}
// 		if (armorDivisor !== 1) {
// 			buffer.push(`(${armorDivisor})`)
// 		}
// 		let t = this.type.trim()
// 		if (t !== "") {
// 			if (buffer.length !== 0) buffer.push(" ")
// 			buffer.push(t)
// 		}
//
// 		if (this.fragmentation !== null) {
// 			const frag = this.fragmentation.stringExtra(actor.system.settings.use_modifying_dice_plus_adds)
// 			if (frag !== "0") {
// 				if (buffer.length !== 0) buffer.push(" ")
// 				buffer.push("[", frag)
// 				if (this.fragmentation_armor_divisor !== 1) buffer.push(`(${this.fragmentation_armor_divisor})`)
// 				t = this.fragmentation_type.trim()
// 				if (t !== "") buffer.push(" ", t)
// 				buffer.push("]")
// 			}
// 		}
// 		return buffer.toString()
// 	}
//
// 	get baseDamageDice(): DiceGURPS {
// 		if (this.parent === null) return new DiceGURPS({ sides: 6, multiplier: 1 })
// 		const actor = this.parent.actor
// 		if (actor === null || !actor.isOfType(ActorType.Character)) return new DiceGURPS({ sides: 6, multiplier: 1 })
// 		const maxSt = this.parent.strength.resolve(this.parent, null).min * 3
// 		let st = 0
// 		const container = this.parent.parent.container
// 		if (container !== null && !(container instanceof Promise)) {
// 			st = container.system.ratedStrength
// 		}
// 		if (st === 0) {
// 			switch (this.st) {
// 				case stdmg.Option.Thrust:
// 				case stdmg.Option.Swing:
// 					st = actor.system.strikingStrength
// 					break
// 				case stdmg.Option.LiftingThrust:
// 				case stdmg.Option.LiftingSwing:
// 					st = actor.system.liftingStrength
// 					break
// 				case stdmg.Option.TelekineticThrust:
// 				case stdmg.Option.TelekineticSwing:
// 					st = actor.system.telekineticStrength
// 					break
// 				default:
// 					st = Math.trunc(Math.max(actor.system.resolveAttributeCurrent(gid.Strength), 0))
// 			}
// 		}
// 		let percentMin = 0
// 		for (const bonus of this.parent.collectWeaponBonuses(1, null, feature.Type.WeaponEffectiveSTBonus)) {
// 			const amt = bonus.adjustedAmountForWeapon(this.parent)
// 			if (bonus.percent) percentMin += amt
// 			else st += amt
// 		}
// 		if (percentMin !== 0) st += Math.trunc((st * percentMin) / 100)
// 		if (st < 0) st = 0
// 		if (maxSt > 0 && maxSt < st) st = maxSt
// 		if (this.st_mul > 0) st *= this.st_mul
// 		let base = new DiceGURPS({ sides: 6, multiplier: 6 })
// 		if (this.base !== null) base = this.base
// 		if (container !== null && !(container instanceof Promise) && container.isOfType(ItemType.Trait)) {
// 			if (container.system.can_level) multiplyDice(container.system.levels ?? 0, base)
// 		}
// 		let stDamage: DiceGURPS
// 		switch (this.st) {
// 			case stdmg.Option.Thrust:
// 			case stdmg.Option.LiftingThrust:
// 			case stdmg.Option.TelekineticThrust:
// 				stDamage = actor.system.thrustFor(st)
// 				break
// 			case stdmg.Option.Swing:
// 			case stdmg.Option.LiftingSwing:
// 			case stdmg.Option.TelekineticSwing:
// 				stDamage = actor.system.swingFor(st)
// 				break
// 			default:
// 				return base
// 		}
// 		if (
// 			this.leveled &&
// 			container !== null &&
// 			!(container instanceof Promise) &&
// 			container.isOfType(ItemType.Trait)
// 		) {
// 			multiplyDice(container.system.levels ?? 0, stDamage)
// 		}
// 		base = addDice(base, stDamage)
// 		return base
// 	}
// }
//
// function multiplyDice(multiplier: number, d: DiceGURPS): void {
// 	d.count *= multiplier
// 	d.modifier *= multiplier
// 	if (d.multiplier !== 1) d.multiplier *= multiplier
// }
//
// function addDice(left: DiceGURPS, right: DiceGURPS): DiceGURPS {
// 	if (left.sides > 1 && right.sides > 1 && left.sides !== right.sides) {
// 		const sides = Math.min(left.sides, right.sides)
// 		const average = Int.from((sides + 1) / 2)
// 		const averageLeft = Int.from(((left.count * (left.sides + 1)) / 2) * left.multiplier)
// 		const averageRight = Int.from(((right.count * (right.sides + 1)) / 2) * right.multiplier)
// 		const averageBoth = averageLeft + averageRight
// 		return new DiceGURPS({
// 			count: Int.from(averageBoth / average),
// 			sides: sides,
// 			modifier: Int.from(Math.round(averageBoth % average)) + left.modifier + right.modifier,
// 			multiplier: 1,
// 		})
// 	}
// 	return new DiceGURPS({
// 		count: left.count + right.count,
// 		sides: Math.max(left.sides, right.sides),
// 		modifier: left.modifier + right.modifier,
// 		multiplier: left.multiplier + right.multiplier - 1,
// 	})
// }
//
// function adjustDiceForPercentBonus(d: DiceGURPS, percent: number): DiceGURPS {
// 	let count = d.count
// 	let modifier = d.modifier
// 	const averagePerDie = (d.sides + 1) / 2
// 	let average = averagePerDie * count + modifier
// 	modifier = Int.from((modifier * (100 + percent)) / 100)
// 	if (average < 0) count = Math.max(Int.from((count * (100 + percent)) / 100), 0)
// 	else {
// 		average = Int.from((average * (100 + percent)) / 100) - modifier
// 		count = Math.max(Int.from(average / averagePerDie), 0)
// 		modifier += Math.round(average - count * averagePerDie)
// 	}
// 	return new DiceGURPS({
// 		count,
// 		sides: d.sides,
// 		modifier,
// 		multiplier: d.multiplier,
// 	})
// }
//
// interface WeaponDamage
// 	extends WeaponField<AbstractWeaponTemplate, WeaponDamageSchema>,
// 		ModelPropsFromSchema<WeaponDamageSchema> {}
//
// type WeaponDamageSchema = {
// 	type: ToggleableStringField<string, string, true, false, true>
// 	st: ToggleableStringField<stdmg.Option, stdmg.Option, true, false, true>
// 	leveled: ToggleableBooleanField<boolean, boolean, true, false, true>
// 	st_mul: ToggleableNumberField<number, number, true, false, true>
// 	base: fields.SchemaField<DiceSchema, SourceFromSchema<DiceSchema>, DiceGURPS, true, true, true>
// 	armor_divisor: ToggleableNumberField<number, number, true, false, true>
// 	fragmentation: fields.SchemaField<DiceSchema, SourceFromSchema<DiceSchema>, DiceGURPS, true, true, true>
// 	fragmentation_armor_divisor: ToggleableNumberField<number, number, true, false, true>
// 	fragmentation_type: ToggleableStringField<string, string, true, false, true>
// 	modifier_per_die: ToggleableNumberField<number, number, true, false, true>
// }
//
// export { WeaponDamage, type WeaponDamageSchema }
