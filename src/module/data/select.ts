import {
	affects,
	attribute,
	container,
	difficulty,
	display,
	emcost,
	emweight,
	feature,
	movelimit,
	prereq,
	progression,
	selfctrl,
	skillsel,
	spellcmp,
	spellmatch,
	stdmg,
	stlimit,
	study,
	tmcost,
	wsel,
	wswitch,
} from "@util/enum/index.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { Length } from "@util/length.ts"
import { Weight } from "@util/weight.ts"
import { AllManeuverIDs, AllPostures, ApplicableConditions } from "./types.ts"
import {
	AllNumericCompareTypes,
	AllStringCompareTypes,
	ContainedQuantityNumericCompareTypes,
	EFFECT_ACTION,
} from "./constants.ts"
import { allMoveTypeOverrideConditions } from "@system"
import { DurationTypes } from "@item/abstract-effect/data.ts"

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
		length_units: Length.Units.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: LocalizeGURPS.translations.gurps.length_units[c],
			})
		}, {}),
		weight_units: Weight.Units.reduce((acc, c) => {
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
		duration_type: DurationTypes.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: LocalizeGURPS.translations.gurps.enum.duration_type[c],
			})
		}, {}),
	}
	CONFIG.GURPS.select = SELECT_OPTIONS
}
