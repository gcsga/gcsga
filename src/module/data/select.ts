import { AllManeuverIDs, AllPostures } from "@item/condition/data"
import { AllNumericCompareTypes, AllStringCompareTypes, LocalizeGURPS, NumericCompareType } from "@util"
import {
	affects,
	attribute,
	container,
	difficulty,
	emcost,
	emweight,
	feature,
	prereq,
	progression,
	selfctrl,
	skillsel,
	spellcmp,
	stlimit,
	study,
	tmcost,
	wsel,
} from "@util/enum"

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
		numeric_criteria_strict: AllNumericCompareTypes.filter(c => c !== NumericCompareType.AnyNumber).reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: LocalizeGURPS.translations.gurps.numeric_criteria.string[c],
			})
		}, {}),
		string_criteria: AllStringCompareTypes.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: LocalizeGURPS.translations.gurps.string_criteria.string[c],
			})
		}, {}),
		has: {
			true: LocalizeGURPS.translations.gurps.select.has.true,
			false: LocalizeGURPS.translations.gurps.select.has.false,
		},
		all: {
			true: LocalizeGURPS.translations.gurps.select.all.true,
			false: LocalizeGURPS.translations.gurps.select.all.false,
		},
		tmcost: tmcost.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: tmcost.Type.toString(c),
			})
		}, {}),
		emcost: emcost.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: emcost.Type.toString(c),
			})
		}, {}),
		emweight: emweight.Types.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: emweight.Type.toString(c),
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
		stlimit: stlimit.Options.reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: stlimit.Option.toString(c),
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
			{ none: LocalizeGURPS.translations.gurps.maneuver.none }
		),
		postures: AllPostures.reduce(
			(acc, c) => {
				return Object.assign(acc, {
					[c]: LocalizeGURPS.translations.gurps.status[c],
				})
			},
			{ none: LocalizeGURPS.translations.gurps.maneuver.none }
		),
	}
	CONFIG.GURPS.SELECT_OPTIONS = SELECT_OPTIONS
}
