/* eslint-disable jest/no-disabled-tests */

import { DamageAttacker, DamageRoll } from "@module/apps/damage_calculator/index.ts"
import { DamageHitLocation, _Attacker, _DamageRoll, _Target, _create } from "./common.ts"
import { DamageType, DamageTypes } from "@module/apps/damage_calculator/damage_type.ts"
import { DiceGURPS } from "@module/dice/index.ts"

const Torso = "Torso"

// Add real tests here.
describe("Damage calculator", () => {
	let _attacker: DamageAttacker
	let _target: _Target
	let _roll: DamageRoll

	let _torso: DamageHitLocation
	let _vitals: DamageHitLocation
	let _skull: DamageHitLocation
	let _eye: DamageHitLocation
	let _face: DamageHitLocation
	let _neck: DamageHitLocation
	let _groin: DamageHitLocation
	let _arm: DamageHitLocation
	let _leg: DamageHitLocation
	let _hand: DamageHitLocation
	let _foot: DamageHitLocation

	beforeEach(() => {
		_attacker = new _Attacker()
		_target = new _Target()
		_roll = new _DamageRoll()
		_roll.attacker = _attacker
		_roll.hits[0] = { basicDamage: 0, locationId: Torso }
		_roll.armorDivisor = 1
		_roll.damageType = DamageTypes.cr
		_roll.dice = new DiceGURPS("2d")

		_torso = DamageHitLocation.fromObject(
			{
				choice_name: Torso,
				description: "",
				dr_bonus: 0,
				table_name: Torso,
				hit_penalty: 0,
				id: "torso",
				slots: 2,
			},
			_target,
		)

		_vitals = DamageHitLocation.fromObject(
			{
				choice_name: "Vitals",
				description: "",
				dr_bonus: 0,
				table_name: "Vitals",
				hit_penalty: -3,
				id: "vitals",
				slots: 0,
			},
			_target,
		)

		_skull = DamageHitLocation.fromObject(
			{
				choice_name: "Skull",
				description: "",
				dr_bonus: 2,
				table_name: "Skull",
				hit_penalty: -7,
				id: "skull",
				slots: 0,
			},
			_target,
		)

		_eye = DamageHitLocation.fromObject(
			{
				choice_name: "Eye",
				description: "",
				dr_bonus: 0,
				table_name: "Eye",
				hit_penalty: -9,
				id: "eye",
				slots: 0,
			},
			_target,
		)

		_face = DamageHitLocation.fromObject(
			{
				choice_name: "Face",
				description: "",
				dr_bonus: 0,
				table_name: "Face",
				hit_penalty: -5,
				id: "face",
				slots: 1,
			},
			_target,
		)

		_neck = DamageHitLocation.fromObject(
			{
				choice_name: "Neck",
				description: "",
				dr_bonus: 0,
				table_name: "Neck",
				hit_penalty: -5,
				id: "neck",
				slots: 1,
			},
			_target,
		)

		_groin = DamageHitLocation.fromObject(
			{
				choice_name: "Groin",
				description: "",
				dr_bonus: 0,
				table_name: "Groin",
				hit_penalty: -5,
				id: "groin",
				slots: 1,
			},
			_target,
		)

		_arm = DamageHitLocation.fromObject(
			{
				choice_name: "Arm",
				description: "",
				dr_bonus: 0,
				table_name: "Arm",
				hit_penalty: -2,
				id: "arm",
				slots: 1,
			},
			_target,
		)

		_leg = DamageHitLocation.fromObject(
			{
				choice_name: "Leg",
				description: "",
				dr_bonus: 0,
				table_name: "Leg",
				hit_penalty: -2,
				id: "leg",
				slots: 2,
			},
			_target,
		)

		_hand = DamageHitLocation.fromObject(
			{
				choice_name: "Hand",
				description: "",
				dr_bonus: 0,
				table_name: "Hand",
				hit_penalty: -4,
				id: "hand",
				slots: 1,
			},
			_target,
		)

		_foot = DamageHitLocation.fromObject(
			{
				choice_name: "Foot",
				description: "",
				dr_bonus: 0,
				table_name: "Foot",
				hit_penalty: -4,
				id: "foot",
				slots: 1,
			},
			_target,
		)

		_target.hitLocationTable.locations.push(_torso)
		_target.hitLocationTable.locations.push(_vitals)
		_target.hitLocationTable.locations.push(_skull)
		_target.hitLocationTable.locations.push(_eye)
		_target.hitLocationTable.locations.push(_face)
		_target.hitLocationTable.locations.push(_neck)
		_target.hitLocationTable.locations.push(_groin)
		_target.hitLocationTable.locations.push(_arm)
		_target.hitLocationTable.locations.push(_leg)
		_target.hitLocationTable.locations.push(_hand)
		_target.hitLocationTable.locations.push(_foot)
		_roll.hits[0].basicDamage = 10
	})

	describe("B378: Damage Roll.", () => {
		it("The result of the damage roll is the hit’s “basic damage.”", () => {
			_roll.hits[0].basicDamage = 8
			_roll.hits[0].locationId = Torso
			const calc = _create(_roll, _target)

			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "8", notes: "HP" },
				{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "0", notes: "Torso" },
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "8", notes: "= 8 – 0" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "8", notes: "= 8 × 1" },
			])
		})

		it("(Knockback Only does no damage.)", () => {
			_roll.hits[0].basicDamage = 8
			_roll.damageType = DamageTypes.kb
			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "8", notes: "HP" },
				{
					substep: "gurps.dmgcalc.substep.adjusted_damage",
					text: "0",
					notes: "gurps.dmgcalc.description.knockback_only",
				},
				{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "0", notes: "Torso" },
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "0", notes: "= 0 – 0" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.kb","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "0", notes: "= 0 × 1" },
			])
		})
	})

	describe("B378: Damage Resistance and Penetration. Subtract DR from basic damage. The result is the “penetrating damage”", () => {
		it("If your target has any Damage Resistance (DR) he subtracts this from your damage roll.", () => {
			_roll.hits[0].basicDamage = 8
			_torso._map.set("all", 2)

			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "8", notes: "HP" },
				{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "2", notes: "Torso" },
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "6", notes: "= 8 – 2" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "6", notes: "= 6 × 1" },
			])
		})

		it("If your damage roll is less than or equal to your target’s effective DR, your attack failed to penetrate.", () => {
			_roll.hits[0].basicDamage = 5
			_torso._map.set("all", 9)

			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "5", notes: "HP" },
				{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "9", notes: "Torso" },
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "0", notes: "= 5 – 9" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "0", notes: "= 0 × 1" },
			])
		})

		it("(Direct Injury ignores DR.)", () => {
			_roll.damageType = DamageTypes.injury
			_torso._map.set("all", 9)

			_roll.hits[0].basicDamage = 8
			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "8", notes: "HP" },
				{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "9", notes: "Torso" },
				{
					substep: "gurps.dmgcalc.substep.effective_dr",
					text: "0",
					notes: "gurps.dmgcalc.description.ignores_dr",
				},
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "8", notes: "= 8 – 0" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.injury","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "8", notes: "= 8 × 1" },
			])
		})
	})

	describe("B378: Armor Divisors and Penetration Modifiers.", () => {
		beforeEach(() => {
			_roll.hits[0].basicDamage = 20
		})

		describe("A divisor of (2) or more means that DR protects at reduced value against the attack.", () => {
			it("Divide the target’s DR by the number in parentheses before subtracting it from basic damage; e.g., (2) means DR protects at half value.", () => {
				_torso._map.set("all", 20)
				_roll.armorDivisor = 2
				let calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "20",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "20", notes: "Torso" },
					{
						substep: "gurps.dmgcalc.substep.effective_dr",
						text: "10",
						notes: 'gurps.dmgcalc.description.armor_divisor:{"divisor":2}',
					},
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "10", notes: "= 20 – 10" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×1",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Torso"}',
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "10", notes: "= 10 × 1" },
				])

				_roll.armorDivisor = 0.5
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "20",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "20", notes: "Torso" },
					{
						substep: "gurps.dmgcalc.substep.effective_dr",
						text: "40",
						notes: 'gurps.dmgcalc.description.armor_divisor:{"divisor":0.5}',
					},
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "0", notes: "= 20 – 40" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×1",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Torso"}',
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "0", notes: "= 0 × 1" },
				])
			})

			it("(Ignores DR.)", () => {
				_torso._map.set("all", 20)
				_roll.armorDivisor = 0
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						notes: "HP",
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "20",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "20", notes: "Torso" },
					{
						substep: "gurps.dmgcalc.substep.effective_dr",
						text: "0",
						notes: "gurps.dmgcalc.description.armor_divisor_ignores",
					},
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "20", notes: "= 20 – 0" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×1",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Torso"}',
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "20", notes: "= 20 × 1" },
				])
			})
		})

		describe("Some divisors are fractions, such as (0.5), (0.2), or (0.1). DR is increased against such attacks:", () => {
			it("... multiply DR by 2 for (0.5),", () => {
				_torso._map.set("all", 5)

				_roll.armorDivisor = 0.5
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "20",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
					{
						substep: "gurps.dmgcalc.substep.effective_dr",
						text: "10",
						notes: 'gurps.dmgcalc.description.armor_divisor:{"divisor":0.5}',
					},
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "10", notes: "= 20 – 10" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×1",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Torso"}',
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "10", notes: "= 10 × 1" },
				])
			})

			it("In addition, if you have any level of this limitation, targets that have DR 0 get DR 1 against your attack.", () => {
				_torso._map.set("all", 0)
				_roll.armorDivisor = 0.5
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "20",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "0", notes: "Torso" },
					{
						substep: "gurps.dmgcalc.substep.effective_dr",
						text: "1",
						notes: 'gurps.dmgcalc.description.armor_divisor:{"divisor":0.5}',
					},
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "19", notes: "= 20 – 1" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×1",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Torso"}',
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "19", notes: "= 19 × 1" },
				])
			})
		})
	})

	describe("B379: Wounding Modifiers and Injury. If there is any penetrating damage, multiply it by the attack’s “wounding modifier.”", () => {
		beforeEach(() => {
			_torso._map.set("all", 5)
			_roll.hits[0].basicDamage = 11
		})

		it("Small piercing (pi-): ×0.5.", () => {
			_roll.damageType = DamageTypes["pi-"]
			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "11", notes: "HP" },
				{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "6", notes: "= 11 – 5" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×&frac12;",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.pi-","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "3", notes: "= 6 × &frac12;" },
			])
		})

		it("Override: ×2.5.", () => {
			_roll.damageType = DamageTypes["pi-"]
			const calc = _create(_roll, _target)
			calc.hits[0].woundingModifierOverride = 2.5
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "11", notes: "HP" },
				{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "6", notes: "= 11 – 5" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×2&frac12;",
					notes: "gurps.dmgcalc.override",
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "15", notes: "= 6 × 2&frac12;" },
			])
		})
	})

	describe("B379: Flexible Armor and Blunt Trauma. An attack that does crushing, cutting, impaling, or piercing damage may inflict “blunt trauma” if it fails to penetrate flexible DR.", () => {
		beforeEach(() => {
			_torso._map.set("all", 20)
		})

		it("For every full 10 points of cutting, impaling, or piercing damage stopped by your DR, you suffer 1 HP of injury due to blunt trauma.", () => {
			_roll.damageType = DamageTypes.cut
			_roll.hits[0].basicDamage = 9
			let calc = _create(_roll, _target)
			calc.hits[0].flexibleArmorOverride = true
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "9", notes: "HP" },
				{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "20", notes: "Torso" },
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "0", notes: "= 9 – 20" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1&frac12;",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cut","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "0", notes: "= 0 × 1&frac12;" },
			])

			_roll.hits[0].basicDamage = 10
			calc = _create(_roll, _target)
			calc.hits[0].flexibleArmorOverride = true
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "10", notes: "HP" },
				{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "20", notes: "Torso" },
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "0", notes: "= 10 – 20" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1&frac12;",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cut","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "0", notes: "= 0 × 1&frac12;" },
				{
					substep: "gurps.dmgcalc.substep.adjusted_injury",
					text: "1",
					notes: "gurps.dmgcalc.description.blunt_trauma",
				},
			])

			_roll.hits[0].basicDamage = 20
			calc = _create(_roll, _target)
			calc.hits[0].flexibleArmorOverride = true
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "20", notes: "HP" },
				{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "20", notes: "Torso" },
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "0", notes: "= 20 – 20" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1&frac12;",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cut","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "0", notes: "= 0 × 1&frac12;" },
				{
					substep: "gurps.dmgcalc.substep.adjusted_injury",
					text: "2",
					notes: "gurps.dmgcalc.description.blunt_trauma",
				},
			])
		})

		it("If even one point of damage penetrates your flexible DR, however, you do not suffer blunt trauma.", () => {
			_roll.damageType = DamageTypes["pi-"]
			_roll.hits[0].basicDamage = 21
			const calc = _create(_roll, _target)
			calc.hits[0].flexibleArmorOverride = true
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "21", notes: "HP" },
				{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "20", notes: "Torso" },
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "1", notes: "= 21 – 20" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×&frac12;",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.pi-","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "1", notes: "= 1 × &frac12;" },
			])
		})
	})

	describe("B380: Injury to Unliving, Homogenous, and Diffuse Targets.", () => {
		describe("Unliving.", () => {
			beforeEach(() => {
				_torso._map.set("all", 5)
				_target.injuryTolerance = "Unliving"
				_roll.hits[0].locationId = Torso
			})

			it("This gives impaling and huge piercing a wounding modifier of ×1; ...", () => {
				_roll.damageType = DamageTypes.imp
				_roll.hits[0].basicDamage = 11
				let calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "11",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "6", notes: "= 11 – 5" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×2",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.imp","location":"Torso"}',
					},
					{
						substep: "gurps.dmgcalc.substep.injury_tolerance",
						text: "×1",
						notes: "gurps.dmgcalc.tolerance.unliving",
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "6", notes: "= 6 × 1" },
				])

				_roll.damageType = DamageTypes["pi++"]
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "11",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "6", notes: "= 11 – 5" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×2",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.pi++","location":"Torso"}',
					},
					{
						substep: "gurps.dmgcalc.substep.injury_tolerance",
						text: "×1",
						notes: "gurps.dmgcalc.tolerance.unliving",
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "6", notes: "= 6 × 1" },
				])
			})

			it("... large piercing, ×1/2;", () => {
				_roll.damageType = DamageTypes["pi+"]
				_roll.hits[0].basicDamage = 11
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "11",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "6", notes: "= 11 – 5" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×1&frac12;",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.pi+","location":"Torso"}',
					},
					{
						substep: "gurps.dmgcalc.substep.injury_tolerance",
						text: "×&frac12;",
						notes: "gurps.dmgcalc.tolerance.unliving",
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "3", notes: "= 6 × &frac12;" },
				])
			})

			it("... piercing, ×1/3;", () => {
				_roll.damageType = DamageTypes.pi
				_roll.hits[0].basicDamage = 11
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "11",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "6", notes: "= 11 – 5" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×1",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.pi","location":"Torso"}',
					},
					{
						substep: "gurps.dmgcalc.substep.injury_tolerance",
						text: "×&frac13;",
						notes: "gurps.dmgcalc.tolerance.unliving",
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "2", notes: "= 6 × &frac13;" },
				])
			})

			it("... and small piercing, ×1/5.", () => {
				_roll.damageType = DamageTypes["pi-"]
				_roll.hits[0].basicDamage = 15
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "15",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "10", notes: "= 15 – 5" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×&frac12;",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.pi-","location":"Torso"}',
					},
					{
						substep: "gurps.dmgcalc.substep.injury_tolerance",
						text: "×&frac15;",
						notes: "gurps.dmgcalc.tolerance.unliving",
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "2", notes: "= 10 × &frac15;" },
				])
			})
		})

		describe("Homogenous.", () => {
			beforeEach(() => {
				_torso._map.set("all", 5)
				_target.injuryTolerance = "Homogenous"
			})

			it("This gives impaling and huge piercing a wounding modifier of ×1/2; ...", () => {
				const types = [DamageTypes.imp, DamageTypes["pi++"]]
				for (const type of types) {
					_roll.damageType = type
					_roll.hits[0].basicDamage = 11
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.steps).toMatchObject([
						{
							substep: "gurps.dmgcalc.substep.basic_damage",
							text: "11",
							notes: "HP",
						},
						{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
						{ substep: "gurps.dmgcalc.substep.penetrating", text: "6", notes: "= 11 – 5" },
						{
							substep: "gurps.dmgcalc.substep.wounding_modifier",
							text: "×2",
							notes: `gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.${type.id}","location":"Torso"}`,
						},

						{
							substep: "gurps.dmgcalc.substep.injury_tolerance",
							text: "×&frac12;",
							notes: "gurps.dmgcalc.tolerance.homogenous",
						},
						{ substep: "gurps.dmgcalc.substep.injury", text: "3", notes: "= 6 × &frac12;" },
					])
				}
			})

			it("... large piercing, ×1/3;", () => {
				_roll.damageType = DamageTypes["pi+"]
				_roll.hits[0].basicDamage = 11
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "11",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "6", notes: "= 11 – 5" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×1&frac12;",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.pi+","location":"Torso"}',
					},
					{
						substep: "gurps.dmgcalc.substep.injury_tolerance",
						text: "×&frac13;",
						notes: "gurps.dmgcalc.tolerance.homogenous",
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "2", notes: "= 6 × &frac13;" },
				])
			})

			it("... piercing, ×1/5;", () => {
				_roll.damageType = DamageTypes.pi
				_roll.hits[0].basicDamage = 15
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "15",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "10", notes: "= 15 – 5" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×1",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.pi","location":"Torso"}',
					},
					{
						substep: "gurps.dmgcalc.substep.injury_tolerance",
						text: "×&frac15;",
						notes: "gurps.dmgcalc.tolerance.homogenous",
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "2", notes: "= 10 × &frac15;" },
				])
			})

			it("... and small piercing, ×1/10.", () => {
				_roll.damageType = DamageTypes["pi-"]
				_roll.hits[0].basicDamage = 15
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "15",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "10", notes: "= 15 – 5" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×&frac12;",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.pi-","location":"Torso"}',
					},
					{
						substep: "gurps.dmgcalc.substep.injury_tolerance",
						text: "×1/10",
						notes: "gurps.dmgcalc.tolerance.homogenous",
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "1", notes: "= 10 × 1/10" },
				])
			})
		})

		describe("Diffuse.", () => {
			beforeEach(() => {
				_torso._map.set("all", 5)
				_target.injuryTolerance = "Diffuse"
				_roll.hits[0].basicDamage = 100
			})

			it("Impaling and piercing attacks (of any size) never do more than 1 HP of injury.", () => {
				const types: [DamageType, string][] = [
					[DamageTypes.imp, "2"],
					[DamageTypes["pi++"], "2"],
					[DamageTypes["pi+"], "1.5"],
					[DamageTypes.pi, "1"],
					[DamageTypes["pi-"], "1/2"],
				]
				for (const type of [types[0], types[1]]) {
					_roll.damageType = type[0]
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.steps).toMatchObject([
						{
							substep: "gurps.dmgcalc.substep.basic_damage",
							text: "100",
							notes: "HP",
						},
						{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
						{ substep: "gurps.dmgcalc.substep.penetrating", text: "95", notes: "= 100 – 5" },
						{
							substep: "gurps.dmgcalc.substep.wounding_modifier",
							text: "×2",
							notes: `gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.${type[0].id}","location":"Torso"}`,
						},
						{ substep: "gurps.dmgcalc.substep.injury", text: "190", notes: "= 95 × 2" },
						{
							substep: "gurps.dmgcalc.substep.adjusted_injury",
							text: "1",
							notes: 'gurps.dmgcalc.description.diffuse_max:{"value":1}',
						},
					])
				}

				_roll.damageType = DamageTypes["pi+"]
				let calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "100",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "95", notes: "= 100 – 5" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×1&frac12;",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.pi+","location":"Torso"}',
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "142", notes: "= 95 × 1&frac12;" },
					{
						substep: "gurps.dmgcalc.substep.adjusted_injury",
						text: "1",
						notes: 'gurps.dmgcalc.description.diffuse_max:{"value":1}',
					},
				])

				_roll.damageType = DamageTypes.pi
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "100",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "95", notes: "= 100 – 5" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×1",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.pi","location":"Torso"}',
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "95", notes: "= 95 × 1" },
					{
						substep: "gurps.dmgcalc.substep.adjusted_injury",
						text: "1",
						notes: 'gurps.dmgcalc.description.diffuse_max:{"value":1}',
					},
				])

				_roll.damageType = DamageTypes["pi-"]
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "100",
						notes: "HP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "95", notes: "= 100 – 5" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×&frac12;",
						notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.pi-","location":"Torso"}',
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "47", notes: "= 95 × &frac12;" },
					{
						substep: "gurps.dmgcalc.substep.adjusted_injury",
						text: "1",
						notes: 'gurps.dmgcalc.description.diffuse_max:{"value":1}',
					},
				])
			})

			it("Other attacks can never do more than 2 HP of injury.", () => {
				const types: [DamageType, number][] = [
					[DamageTypes.burn, 1],
					[DamageTypes.cor, 1],
					[DamageTypes.cr, 1],
					[DamageTypes.cut, 1.5],
					[DamageTypes.tox, 1],
				]
				for (const [type, multiplier] of types) {
					_roll.damageType = type
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.steps).toMatchObject([
						{
							substep: "gurps.dmgcalc.substep.basic_damage",
							text: "100",
							notes: "HP",
						},
						{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "5", notes: "Torso" },
						{ substep: "gurps.dmgcalc.substep.penetrating", text: "95", notes: "= 100 – 5" },
						{
							substep: "gurps.dmgcalc.substep.wounding_modifier",
							text: `×${multiplier === 1.5 ? "1&frac12;" : multiplier}`,
							notes: `gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.${type.id}","location":"Torso"}`,
						},
						{
							substep: "gurps.dmgcalc.substep.injury",
							text: `${Math.floor(95 * multiplier)}`,
							notes: `= 95 × ${multiplier === 1.5 ? "1&frac12;" : multiplier}`,
						},
						{
							substep: "gurps.dmgcalc.substep.adjusted_injury",
							text: "2",
							notes: 'gurps.dmgcalc.description.diffuse_max:{"value":2}',
						},
					])
				}

				_roll.damageType = DamageTypes.fat
				const calc = _create(_roll, _target)
				calc.hits[0].damageResistanceOverride = 7
				expect(calc.hits[0].results.steps).toMatchObject([
					{
						substep: "gurps.dmgcalc.substep.basic_damage",
						text: "100",
						notes: "FP",
					},
					{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "7", notes: "gurps.dmgcalc.override" },
					{ substep: "gurps.dmgcalc.substep.penetrating", text: "93", notes: "= 100 – 7" },
					{
						substep: "gurps.dmgcalc.substep.wounding_modifier",
						text: "×1",
						notes: "gurps.dmgcalc.description.fatigue",
					},
					{ substep: "gurps.dmgcalc.substep.injury", text: "93", notes: "= 93 × 1" },
					{
						substep: "gurps.dmgcalc.substep.adjusted_injury",
						text: "2",
						notes: 'gurps.dmgcalc.description.diffuse_max:{"value":2}',
					},
				])
			})
		})
	})

	describe("Arm or Leg.", () => {
		beforeEach(() => {
			_roll.hits[0].basicDamage = 6
		})
		it("...but damage beyond the minimum required to inflict a crippling injury is lost.", () => {
			_roll.hits[0].locationId = "Arm"

			_target.hitPoints.value = 15
			_roll.hits[0].basicDamage = 10
			_roll.damageType = DamageTypes.cr
			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "10", notes: "HP" },
				{ substep: "gurps.dmgcalc.substep.damage_resistance", text: "0", notes: "Arm" },
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "10", notes: "= 10 – 0" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Arm"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "10", notes: "= 10 × 1" },
				{
					substep: "gurps.dmgcalc.substep.max_location",
					text: "8",
					notes: 'gurps.dmgcalc.description.location_max:{"location":"Arm"}',
				},
			])
		})
	})

	describe("B414: Explosions.", () => {
		beforeEach(() => {
			_roll.dice = new DiceGURPS("3d")
			_roll.damageModifier = "ex"
		})

		it("An explosion inflicts “collateral damage” on everything within (2 × dice of damage) yards.", () => {
			_roll.dice = new DiceGURPS("1d+3")
			_roll.range = 3
			_roll.hits[0].basicDamage = 9

			const calc = _create(_roll, _target)
			calc.rangeOverride = 3
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "9", notes: "HP" },
				{
					substep: "gurps.dmgcalc.substep.adjusted_damage",
					text: "0",
					notes: "gurps.dmgcalc.description.explosion_outofrange",
				},
				{
					substep: "gurps.dmgcalc.substep.damage_resistance",
					text: "0",
					notes: "Torso",
				},
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "0", notes: "= 0 – 0" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "0", notes: "= 0 × 1" },
			])

			calc.rangeOverride = 2
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "9", notes: "HP" },
				{
					substep: "gurps.dmgcalc.substep.adjusted_damage",
					text: "1",
					notes: 'gurps.dmgcalc.description.explosion_range:{"range":2}',
				},
				{
					substep: "gurps.dmgcalc.substep.damage_resistance",
					text: "0",
					notes: "Torso",
				},
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "1", notes: "= 1 – 0" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "1", notes: "= 1 × 1" },
			])
		})

		it("Roll this damage but divide it by (3 × yards from the center of the blast), rounding down.", () => {
			_roll.hits[0].basicDamage = 13
			_torso._map.set("all", 1)

			const calc = _create(_roll, _target)
			calc.rangeOverride = 2
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "13", notes: "HP" },
				{
					substep: "gurps.dmgcalc.substep.adjusted_damage",
					text: "2",
					notes: 'gurps.dmgcalc.description.explosion_range:{"range":2}',
				},
				{
					substep: "gurps.dmgcalc.substep.damage_resistance",
					text: "1",
					notes: "Torso",
				},
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "1", notes: "= 2 – 1" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "1", notes: "= 1 × 1" },
			])

			calc.rangeOverride = 1
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "13", notes: "HP" },
				{
					substep: "gurps.dmgcalc.substep.adjusted_damage",
					text: "4",
					notes: 'gurps.dmgcalc.description.explosion_range:{"range":1}',
				},
				{
					substep: "gurps.dmgcalc.substep.damage_resistance",
					text: "1",
					notes: "Torso",
				},
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "3", notes: "= 4 – 1" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "3", notes: "= 3 × 1" },
			])

			calc.rangeOverride = 3
			expect(calc.hits[0].results.steps).toMatchObject([
				{ substep: "gurps.dmgcalc.substep.basic_damage", text: "13", notes: "HP" },
				{
					substep: "gurps.dmgcalc.substep.adjusted_damage",
					text: "1",
					notes: 'gurps.dmgcalc.description.explosion_range:{"range":3}',
				},
				{
					substep: "gurps.dmgcalc.substep.damage_resistance",
					text: "1",
					notes: "Torso",
				},
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "0", notes: "= 1 – 1" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×1",
					notes: 'gurps.dmgcalc.description.damage_location:{"type":"gurps.dmgcalc.type.cr","location":"Torso"}',
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "0", notes: "= 0 × 1" },
			])
		})

		it.skip("If an explosive attack has an armor divisor, it does not apply to the collateral damage.", () => {
			_roll.dice = new DiceGURPS("6d")
			_roll.hits[0].basicDamage = 24
			_roll.armorDivisor = 3
			_torso._map.set("all", 3)

			const calc = _create(_roll, _target)
			calc.rangeOverride = 2
			expect(calc.hits[0].results.steps).toMatchObject([
				{
					substep: "gurps.dmgcalc.substep.basic_damage",
					text: "24",
					notes: "HP",
				},
				{
					substep: "gurps.dmgcalc.substep.adjusted_damage",
					text: "4",
					notes: 'gurps.dmgcalc.description.explosion_range:{"range":2}',
				},
				{
					substep: "gurps.dmgcalc.substep.damage_resistance",
					text: "3",
					notes: "Torso",
				},
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "1", notes: "= 4 – 3" },
				{ substep: "gurps.dmgcalc.substep.wounding_modifier", text: "×1", notes: "cr, torso" },
				{ substep: "gurps.dmgcalc.substep.injury", text: "1", notes: "= 1 × 1" },
			])

			calc.rangeOverride = 1
			expect(calc.hits[0].results.steps).toMatchObject([
				{
					substep: "gurps.dmgcalc.substep.basic_damage",
					text: "24",
					notes: "HP",
				},
				{
					substep: "gurps.dmgcalc.substep.adjusted_damage",
					text: "8",
					notes: 'gurps.dmgcalc.description.explosion_range:{"range":1}',
				},
				{
					substep: "gurps.dmgcalc.substep.damage_resistance",
					text: "3",
					notes: "Torso",
				},
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "5", notes: "= 8 – 3" },
				{ substep: "gurps.dmgcalc.substep.wounding_modifier", text: "×1", notes: "cr, torso" },
				{ substep: "gurps.dmgcalc.substep.injury", text: "5", notes: "= 5 × 1" },
			])

			calc.rangeOverride = 3
			expect(calc.hits[0].results.steps).toMatchObject([
				{
					substep: "gurps.dmgcalc.substep.basic_damage",
					text: "24",
					notes: "HP",
				},
				{
					substep: "gurps.dmgcalc.substep.adjusted_damage",
					text: "2",
					notes: 'gurps.dmgcalc.description.explosion_range:{"range":3}',
				},
				{
					substep: "gurps.dmgcalc.substep.damage_resistance",
					text: "3",
					notes: "Torso",
				},
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "0", notes: "= 2 – 3" },
				{ substep: "gurps.dmgcalc.substep.wounding_modifier", text: "×1", notes: "cr, torso" },
				{ substep: "gurps.dmgcalc.substep.injury", text: "0", notes: "= 0 × 1" },
			])
		})

		it("Internal Explosions: DR has no effect! In addition, treat the blast as an attack on the vitals, with a ×3 wounding modifier.", () => {
			_roll.dice = new DiceGURPS("6d")
			_roll.hits[0].basicDamage = 24
			_roll.internalExplosion = true
			_torso._map.set("all", 3)

			const calc = _create(_roll, _target)
			calc.rangeOverride = 0
			expect(calc.hits[0].results.steps).toMatchObject([
				{
					substep: "gurps.dmgcalc.substep.basic_damage",
					text: "24",
					notes: "HP",
				},
				{
					substep: "gurps.dmgcalc.substep.damage_resistance",
					text: "3",
					notes: "Torso",
				},
				{
					substep: "gurps.dmgcalc.substep.effective_dr",
					text: "0",
					notes: "gurps.dmgcalc.description.explosion_internal",
				},
				{ substep: "gurps.dmgcalc.substep.penetrating", text: "24", notes: "= 24 – 0" },
				{
					substep: "gurps.dmgcalc.substep.wounding_modifier",
					text: "×3",
					notes: "gurps.dmgcalc.description.explosion_internal",
				},
				{ substep: "gurps.dmgcalc.substep.injury", text: "72", notes: "= 24 × 3" },
			])
		})
	})
})
