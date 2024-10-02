import { LocalizeGURPS } from "@util/localize.ts"
import { equalFold } from "@module/data/item/compontents/string-criteria.ts"

export namespace align {
	export enum Option {
		Start = "start",
		Middle = "middle",
		End = "end",
		Fill = "fill",
	}

	export namespace Option {
		export function ensureValid(O: Option): Option {
			if (Options.includes(O)) return O
			return Options[0]
		}

		export function toString(O: Option): string {
			return LocalizeGURPS.translations.gurps.enum.align[O]
		}

		export function extractOption(s: string): Option {
			for (const one of Options) {
				if (equalFold(one, s)) return one
			}
			return Options[0]
		}
	}
	export const Options: Option[] = [Option.Start, Option.Middle, Option.End, Option.Fill]
}
