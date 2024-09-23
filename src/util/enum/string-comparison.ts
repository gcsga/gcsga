export namespace StringComparison {
	export enum Option {
		AnyString = "none",
		IsString = "is",
		IsNotString = "is_not",
		ContainsString = "contains",
		DoesNotContainString = "does_not_contain",
		StartsWithString = "starts_with",
		DoesNotStartWithString = "does_not_start_with",
		EndsWithString = "ends_with",
		DoesNotEndWithString = "does_not_end_with",
	}

	export const Options: Option[] = [
		Option.AnyString,
		Option.IsString,
		Option.IsNotString,
		Option.ContainsString,
		Option.DoesNotContainString,
		Option.StartsWithString,
		Option.DoesNotStartWithString,
		Option.EndsWithString,
		Option.DoesNotEndWithString,
	]

	export const OptionsChoices: Readonly<Record<Option, string>> = Object.freeze({
		[Option.AnyString]: `GURPS.Enum.StringComparison.${Option.AnyString}`,
		[Option.IsString]: `GURPS.Enum.StringComparison.${Option.IsString}`,
		[Option.IsNotString]: `GURPS.Enum.StringComparison.${Option.IsNotString}`,
		[Option.ContainsString]: `GURPS.Enum.StringComparison.${Option.ContainsString}`,
		[Option.DoesNotContainString]: `GURPS.Enum.StringComparison.${Option.DoesNotContainString}`,
		[Option.StartsWithString]: `GURPS.Enum.StringComparison.${Option.StartsWithString}`,
		[Option.DoesNotStartWithString]: `GURPS.Enum.StringComparison.${Option.DoesNotStartWithString}`,
		[Option.EndsWithString]: `GURPS.Enum.StringComparison.${Option.EndsWithString}`,
		[Option.DoesNotEndWithString]: `GURPS.Enum.StringComparison.${Option.DoesNotEndWithString}`,
	})

	export function CustomOptionsChoices(prefix: string): Record<Option, string> {
		return Object.fromEntries(Options.map(k => [k, game.i18n.localize(`${prefix}.${k}`)])) as Record<Option, string>
	}
}
