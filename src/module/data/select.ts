import { attribute, progression, selfctrl, study } from "@util/enum"

export const SELECT_OPTIONS = {
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
	study_type: study.Types.reduce((acc, c) => {
		return Object.assign(acc, {
			[c]: study.Type.toString(c),
		})
	}, {}),
	attribute_type: attribute.Types.reduce((acc, c) => {
		return Object.assign(acc, {
			[c]: attribute.Type.toString(c),
		})
	}, {}),
	damage_progression: progression.Options.reduce((acc, c) => {
		return Object.assign(acc, {
			[c]: progression.Option.toString(c),
		})
	}, {}),
}
