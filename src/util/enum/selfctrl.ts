import { RollType } from "@module/data/constants.ts"
import { Int } from "@util/fxp.ts"
import { LocalizeGURPS } from "@util/localize.ts"

export namespace selfctrl {
	export enum Roll {
		NoCR = 0,
		CR6 = 6,
		CR7 = 7,
		CR8 = 8,
		CR9 = 9,
		CR10 = 10,
		CR11 = 11,
		CR12 = 12,
		CR13 = 13,
		CR14 = 14,
		CR15 = 15,
	}

	export namespace Roll {
		export function ensureValid(R: Roll): Roll {
			if (Rolls.includes(R)) return R
			return Rolls[0]
		}

		export function index(R: Roll): number {
			return Rolls.indexOf(R) ?? 0
		}

		export function toString(R: Roll): string {
			switch (R) {
				case Roll.NoCR:
				case Roll.CR6:
				case Roll.CR9:
				case Roll.CR12:
				case Roll.CR15:
					return LocalizeGURPS.translations.gurps.enum.selfctrl.roll[R]
				default:
					return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.enum.selfctrl.roll.non_standard, {
						number: R,
					})
			}
		}

		export function toRollableButton(R: Roll): string {
			return `<div data-type="${RollType.ControlRoll}" class="rollable">${Roll.toString(R)}</div>`
		}

		export function multiplier(R: Roll): number {
			switch (R) {
				case Roll.NoCR:
					return 1
				case Roll.CR6:
					return 2
				case Roll.CR7:
					return 1.83
				case Roll.CR8:
					return 1.67
				case Roll.CR9:
					return 1.5
				case Roll.CR10:
					return 1.33
				case Roll.CR11:
					return 1.17
				case Roll.CR12:
					return 1
				case Roll.CR13:
					return 0.83
				case Roll.CR14:
					return 0.67
				case Roll.CR15:
					return 0.5
				default:
					return Roll.multiplier(Roll.NoCR)
			}
		}

		export function minimumRoll(R: Roll): number {
			return Int.from(Roll.ensureValid(R))
		}
	}

	export const Rolls: Roll[] = [
		Roll.NoCR,
		Roll.CR6,
		Roll.CR7,
		Roll.CR8,
		Roll.CR9,
		Roll.CR10,
		Roll.CR11,
		Roll.CR12,
		Roll.CR13,
		Roll.CR14,
		Roll.CR15,
	]

	export enum Adjustment {
		NoCRAdj = "none",
		ActionPenalty = "action_penalty",
		ReactionPenalty = "reaction_penalty",
		FrightCheckPenalty = "fright_check_penalty",
		FrightCheckBonus = "fright_check_bonus",
		MinorCostOfLivingIncrease = "minor_cost_of_living_increase",
		MajorCostOfLivingIncrease = "major_cost_of_living_increase",
	}

	export namespace Adjustment {
		export function ensureValid(A: Adjustment): Adjustment {
			if (Adjustments.includes(A)) return A
			return Adjustments[0]
		}

		export function toString(A: Adjustment): string {
			return LocalizeGURPS.translations.gurps.enum.selfctrl.adjustment.string[A]
		}

		export function altString(A: Adjustment): string {
			return LocalizeGURPS.translations.gurps.enum.selfctrl.adjustment.alt_string[A]
		}

		export function adjustment(A: Adjustment, cr: Roll): number {
			if (cr === Roll.NoCR) return 0
			switch (A) {
				case Adjustment.NoCRAdj:
					return 0
				case Adjustment.ActionPenalty:
				case Adjustment.ReactionPenalty:
				case Adjustment.FrightCheckPenalty:
					return Roll.index(cr) - Rolls.length
				case Adjustment.FrightCheckBonus:
					return Rolls.length - Roll.index(cr)
				case Adjustment.MinorCostOfLivingIncrease:
					return 6 * (Rolls.length - Roll.index(cr))
				case Adjustment.MajorCostOfLivingIncrease:
					return 10 * (1 << (Rolls.length - (Roll.index(cr) + 1)))
			}
		}

		export function description(A: Adjustment, cr: Roll): string {
			switch (true) {
				case cr === Roll.NoCR:
					return ""
				case A === Adjustment.NoCRAdj:
					return Adjustment.altString(A)
				default:
					return LocalizeGURPS.format(
						LocalizeGURPS.translations.gurps.enum.selfctrl.adjustment.alt_string[A],
						{
							penalty: Adjustment.adjustment(A, cr),
						},
					)
			}
		}
	}

	export const Adjustments: Adjustment[] = [
		Adjustment.NoCRAdj,
		Adjustment.ActionPenalty,
		Adjustment.ReactionPenalty,
		Adjustment.FrightCheckPenalty,
		Adjustment.FrightCheckBonus,
		Adjustment.MinorCostOfLivingIncrease,
		Adjustment.MajorCostOfLivingIncrease,
	]
}
