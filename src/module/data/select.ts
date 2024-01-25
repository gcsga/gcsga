import { AllManeuverIDs, AllPostures, ApplicableConditions } from "@item/condition/data.ts"
import { allMoveTypeOverrideConditions } from "@sytem/move_type/data.ts"
import { affects } from "@util/enum/affects.ts"
import { attribute } from "@util/enum/attribute.ts"
import { container } from "@util/enum/container.ts"
import { difficulty } from "@util/enum/difficulty.ts"
import { display } from "@util/enum/display.ts"
import { emcost } from "@util/enum/emcost.ts"
import { emweight } from "@util/enum/emweight.ts"
import { feature } from "@util/enum/feature.ts"
import { movelimit } from "@util/enum/movelimit.ts"
import { prereq } from "@util/enum/prereq.ts"
import { progression } from "@util/enum/progression.ts"
import { selfctrl } from "@util/enum/selfctrl.ts"
import { skillsel } from "@util/enum/skillsel.ts"
import { spellcmp } from "@util/enum/spellcmp.ts"
import { spellmatch } from "@util/enum/spellmatch.ts"
import { stdmg } from "@util/enum/stdmg.ts"
import { stlimit } from "@util/enum/stlimit.ts"
import { study } from "@util/enum/study.ts"
import { tmcost } from "@util/enum/tmcost.ts"
import { wsel } from "@util/enum/wsel.ts"
import { wswitch } from "@util/enum/wswitch.ts"
import { allLengthUnits } from "@util/length.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { allWeightUnits } from "@util/weight.ts"
import { EFFECT_ACTION } from "./misc.ts"
import { AllNumericCompareTypes, ContainedQuantityNumericCompareTypes } from "@util/numeric_criteria.ts"
import { AllStringCompareTypes } from "@util/string_criteria.ts"

export function prepareSelectOptions(): void {
	const SELECT_OPTIONS: Record<string, Record<string, string>> = {
		cr_level: selfctrl.Rolls.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: selfctrl.Roll.toString(c),
			})
		}, {}),
		cr_adj: selfctrl.Adjustments.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: selfctrl.Adjustment.toString(c),
			})
		}, {}),
		study: study.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: study.Type.toString(c),
			})
		}, {}),
		study_level: study.Levels.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: study.Level.toString(c),
			})
		}, {}),
		attribute: attribute.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: attribute.Type.toString(c),
			})
		}, {}),
		progression: progression.Options.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: progression.Option.toString(c),
			})
		}, {}),
		numeric_criteria: AllNumericCompareTypes.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: LocalizeGURPS.translations.gurps.numeric_criteria.string[c],
			})
		}, {}),
		numeric_criteria_strict: ContainedQuantityNumericCompareTypes.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: LocalizeGURPS.translations.gurps.numeric_criteria.quantity[c],
			})
		}, {}),
		string_criteria: AllStringCompareTypes.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: LocalizeGURPS.translations.gurps.string_criteria.string[c],
			})
		}, {}),
		has: {
			true: LocalizeGURPS.translations.gurps.enum.has.true,
			false: LocalizeGURPS.translations.gurps.enum.has.false,
		},
		all: {
			true: LocalizeGURPS.translations.gurps.prereq.list.true,
			false: LocalizeGURPS.translations.gurps.prereq.list.false,
		},
		tmcost: tmcost.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: tmcost.Type.toString(c),
			})
		}, {}),
		emcost: emcost.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: emcost.Type.stringWithExample(c),
			})
		}, {}),
		emweight: emweight.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: emweight.Type.stringWithExample(c),
			})
		}, {}),
		wsel: wsel.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: wsel.Type.toString(c),
			})
		}, {}),
		skillsel: skillsel.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: skillsel.Type.toString(c),
			})
		}, {}),
		spellcmp: spellcmp.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: spellcmp.Type.toString(c),
			})
		}, {}),
		spellmatch: spellmatch.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: spellmatch.Type.toString(c),
			})
		}, {}),
		stlimit: stlimit.Options.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: stlimit.Option.toString(c),
			})
		}, {}),
		stdmg: stdmg.Options.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: stdmg.Option.toString(c),
			})
		}, {}),
		movelimit: movelimit.Options.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: movelimit.Option.toString(c),
			})
		}, {}),
		feature: feature.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: feature.Type.toString(c),
			})
		}, {}),
		feature_strict: feature.TypesWithoutContainedWeightReduction.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: feature.Type.toString(c),
			})
		}, {}),
		prereq: prereq.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: prereq.Type.toString(c),
			})
		}, {}),
		prereq_strict: prereq.TypesWithoutList.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: prereq.Type.toString(c),
			})
		}, {}),
		difficulty: difficulty.Levels.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: difficulty.Level.toString(c),
			})
		}, {}),
		container: container.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: container.Type.toString(c),
			})
		}, {}),
		affects: affects.Options.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: affects.Option.toString(c),
			})
		}, {}),
		percentage: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: c.toString(),
			})
		}, {}),
		maneuvers: AllManeuverIDs.reduce(
			(acc, c) => {
				return Object.assign(acc, {
					[c]: LocalizeGURPS.translations.gurps.maneuver[c],
				})
			},
			{ none: LocalizeGURPS.translations.gurps.maneuver.none },
		),
		postures: AllPostures.reduce(
			(acc, c) => {
				return Object.assign(acc, {
					[c]: LocalizeGURPS.translations.gurps.status[c],
				})
			},
			{ none: LocalizeGURPS.translations.gurps.maneuver.none },
		),
		display: display.Options.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: display.Option.toString(c),
			})
		}, {}),
		length_units: allLengthUnits.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: LocalizeGURPS.translations.gurps.length_units[c],
			})
		}, {}),
		weight_units: allWeightUnits.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: LocalizeGURPS.translations.gurps.weight_units[c],
			})
		}, {}),
		move_override: allMoveTypeOverrideConditions.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: LocalizeGURPS.translations.gurps.enum.move_override[c],
			})
		}, {}),
		wswitch: wswitch.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: wswitch.Type.toString(c),
			})
		}, {}),
		wswitch_value: {
			true: LocalizeGURPS.translations.gurps.enum.wswitch_value.true,
			false: LocalizeGURPS.translations.gurps.enum.wswitch_value.false,
		},
		color: {
			auto: LocalizeGURPS.translations.gurps.enum.color.auto,
			dark: LocalizeGURPS.translations.gurps.enum.color.dark,
			light: LocalizeGURPS.translations.gurps.enum.color.light,
		},
		effect_action: {
			[EFFECT_ACTION.ADD]: LocalizeGURPS.translations.gurps.enum.effect_action.add,
			[EFFECT_ACTION.REMOVE]: LocalizeGURPS.translations.gurps.enum.effect_action.remove,
		},
		conditions: ApplicableConditions.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: LocalizeGURPS.translations.gurps.status[c],
			})
		}, {}),
	}
	CONFIG.GURPS.select = SELECT_OPTIONS
}
