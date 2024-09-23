export namespace NumericComparison {
	export enum Option {
		AnyNumber = "none",
		EqualsNumber = "is",
		NotEqualsNumber = "is_not",
		AtLeastNumber = "at_least",
		AtMostNumber = "at_most",
	}

	export const Options: Option[] = [
		Option.AnyNumber,
		Option.EqualsNumber,
		Option.NotEqualsNumber,
		Option.AtLeastNumber,
		Option.AtMostNumber,
	]

	export const OptionsChoices: Readonly<Record<Option, string>> = Object.freeze({
		[Option.AnyNumber]: `GURPS.Enum.NumericComparison.${Option.AnyNumber}`,
		[Option.EqualsNumber]: `GURPS.Enum.NumericComparison.${Option.EqualsNumber}`,
		[Option.NotEqualsNumber]: `GURPS.Enum.NumericComparison.${Option.NotEqualsNumber}`,
		[Option.AtLeastNumber]: `GURPS.Enum.NumericComparison.${Option.AtLeastNumber}`,
		[Option.AtMostNumber]: `GURPS.Enum.NumericComparison.${Option.AtMostNumber}`,
	})

	export function CustomOptionsChoices(prefix: string): Record<Option, string> {
		return Object.fromEntries(Options.map(k => [k, game.i18n.localize(`${prefix}.${k}`)])) as Record<Option, string>
	}
}
