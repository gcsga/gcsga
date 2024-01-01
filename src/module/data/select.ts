import { selfctrl } from "@util/enum"

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
}
