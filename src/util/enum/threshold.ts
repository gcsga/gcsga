import { LocalizeGURPS } from "@util/localize.ts"

export namespace threshold {
	export enum Op {
		Unknown = "unknown",
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
			return LocalizeGURPS.translations.gurps.enum.threshold.string[O]
		}

		export function altString(O: Op): string {
			return LocalizeGURPS.translations.gurps.enum.threshold.alt_string[O]
		}
	}

	export const Ops: Op[] = [Op.Unknown, Op.HalveMove, Op.HalveDodge, Op.HalveST]
}
