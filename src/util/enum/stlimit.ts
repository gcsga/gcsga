export namespace stlimit {
	export enum Option {
		None = "none",
		StrikingOnly = "striking_only",
		LiftingOnly = "lifting_only",
		ThrowingOnly = "throwing_only",
	}

	export namespace Option {
		export function toString(O: Option): string {
			return `GURPS.Enum.stlimit.${O}`
		}
	}

	export const Options: Option[] = [Option.None, Option.StrikingOnly, Option.LiftingOnly, Option.ThrowingOnly]

	export const OptionsChoices: Readonly<Record<Option, string>> = Object.freeze(
		Object.fromEntries(Options.map(O => [O, Option.toString(O)])) as Record<Option, string>,
	)
}
