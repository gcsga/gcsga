import { equalFold } from "@module/data/item/components/string-criteria.ts"

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
			return `GURPS.Enum.affects.${O}.Name`
		}

		export function altString(O: Option): string {
			return `GURPS.Enum.affects.${O}.Alt`
		}

		export function extractOption(s: string): Option {
			for (const one of Options) {
				if (equalFold(one, s)) return one
			}
			return Options[0]
		}
	}
	export const Options: Option[] = [Option.Total, Option.BaseOnly, Option.LevelsOnly]

	export const OptionsChoices: Readonly<Record<Option, string>> = Object.freeze({
		[Option.Total]: Option.toString(Option.Total),
		[Option.BaseOnly]: Option.toString(Option.BaseOnly),
		[Option.LevelsOnly]: Option.toString(Option.LevelsOnly),
	})
}
