export namespace threshold {
	export enum Op {
		HalveMove = "halve_move",
		HalveDodge = "halve_dodge",
		HalveST = "halve_st",
	}

	export namespace Op {
		export function ensureValid(O: Op): Op {
			if (Ops.includes(O)) return O
			return Ops[0]
		}

		export function toString(O: Op): string {
			return `GURPS.Enum.threshold.${O}.Name`
			// return LocalizeGURPS.translations.gurps.enum.threshold.string[O]
		}

		export function altString(O: Op): string {
			return `GURPS.Enum.threshold.${O}.Hint`
			// return LocalizeGURPS.translations.gurps.enum.threshold.alt_string[O]
		}
	}

	export const Ops: Op[] = [Op.HalveMove, Op.HalveDodge, Op.HalveST]

	export const OpsChoices: Readonly<Record<Op, string>> = Object.freeze({
		[Op.HalveMove]: Op.toString(Op.HalveMove),
		[Op.HalveDodge]: Op.toString(Op.HalveDodge),
		[Op.HalveST]: Op.toString(Op.HalveST),
	})
}
