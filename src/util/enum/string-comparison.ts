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

	export function toString(O: Option): string {
		return `GURPS.Enum.StringComparison.${O}.Name`
	}

	export function altString(O: Option): string {
		return `GURPS.Enum.StringComparison.${O}.NamePlural`
	}

	export function tooltipString(O: Option): string {
		return `GURPS.Enum.StringComparison.${O}.Tooltip`
	}

	export const OptionsChoices: Readonly<Record<Option, string>> = Object.freeze(
		Object.fromEntries(Options.map(O => [O, StringComparison.toString(O)])) as Record<Option, string>,
	)

	export function CustomOptionsChoices(key: string, exclude: Option[] = []): Record<Option, string> {
		return Object.fromEntries(
			Options.filter(k => !exclude.includes(k)).map(k => [
				k,
				game.i18n.format(key, { value: game.i18n.localize(StringComparison.toString(k)) }),
			]),
		) as Record<Option, string>
	}

	export function CustomOptionsChoicesPlural(keySingle: string, keyPlural: string): Record<Option, string> {
		return {
			[Option.AnyString]: game.i18n.format(keySingle, {
				value: game.i18n.localize(StringComparison.toString(Option.AnyString)),
			}),
			[Option.IsString]: game.i18n.format(keySingle, {
				value: game.i18n.localize(StringComparison.toString(Option.IsString)),
			}),
			[Option.IsNotString]: game.i18n.format(keyPlural, {
				value: game.i18n.localize(StringComparison.altString(Option.IsNotString)),
			}),
			[Option.ContainsString]: game.i18n.format(keySingle, {
				value: game.i18n.localize(StringComparison.toString(Option.ContainsString)),
			}),
			[Option.DoesNotContainString]: game.i18n.format(keyPlural, {
				value: game.i18n.localize(StringComparison.altString(Option.DoesNotContainString)),
			}),
			[Option.StartsWithString]: game.i18n.format(keySingle, {
				value: game.i18n.localize(StringComparison.toString(Option.StartsWithString)),
			}),
			[Option.DoesNotStartWithString]: game.i18n.format(keyPlural, {
				value: game.i18n.localize(StringComparison.altString(Option.DoesNotStartWithString)),
			}),
			[Option.EndsWithString]: game.i18n.format(keySingle, {
				value: game.i18n.localize(StringComparison.toString(Option.EndsWithString)),
			}),
			[Option.DoesNotEndWithString]: game.i18n.format(keyPlural, {
				value: game.i18n.localize(StringComparison.altString(Option.DoesNotEndWithString)),
			}),
		}
	}
}
