import { LocalizeGURPS } from "@util/localize"
import { equalFold } from "@util/misc"

export namespace affects {
	export enum Option {
		Total = "total",
		BaseOnly = "base_only",
		LevelsOnly = "levels_only",
	}

	export namespace Option {
		export function ensureValid(O: Option): Option {
			if (Options.includes(O)) return O
			return Options[0]
		}

		export function toString(O: Option): string {
			return LocalizeGURPS.translations.gurps.enum.affects.string[O]
		}

		export function altString(O: Option): string {
			return LocalizeGURPS.translations.gurps.enum.affects.alt_string[O]
		}

		export function extractOption(s: string): Option {
			for (const one of Options) {
				if (equalFold(one, s)) return one
			}
			return Options[0]
		}
	}
	export const Options: Option[] = [Option.Total, Option.BaseOnly, Option.LevelsOnly]
}
