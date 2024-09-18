export namespace progression {
	export enum Option {
		BasicSet = "basic_set",
		KnowingYourOwnStrength = "knowing_your_own_strength",
		NoSchoolGrognardDamage = "no_school_grognard_damage",
		ThrustEqualsSwingMinus2 = "thrust_equals_swing_minus_2",
		SwingEqualsThrustPlus2 = "swing_equals_thrust_plus_2",
		Tbone1 = "tbone_1",
		Tbone1Clean = "tbone_1_clean",
		Tbone2 = "tbone_2",
		Tbone2Clean = "tbone_2_clean",
		PhoenixFlameD3 = "phoenix_flame_d3",
	}

	export namespace Option {
		export function toString(O: Option): string {
			return `GURPS.Enum.progression.${O}.Name`
			// return LocalizeGURPS.translations.gurps.enum.progression.string[O]
		}
		export function toAltString(O: Option): string {
			return `GURPS.Enum.progression.${O}.Hint`
			// return LocalizeGURPS.translations.gurps.enum.progression.alt_string[O]
		}
	}

	export const Options: Option[] = [
		Option.BasicSet,
		Option.KnowingYourOwnStrength,
		Option.NoSchoolGrognardDamage,
		Option.ThrustEqualsSwingMinus2,
		Option.SwingEqualsThrustPlus2,
		Option.Tbone1,
		Option.Tbone1Clean,
		Option.Tbone2,
		Option.Tbone2Clean,
		Option.PhoenixFlameD3,
	]

	export const OptionsChoices: Readonly<Record<Option, string>> = Object.freeze({
		[Option.BasicSet]: Option.toString(Option.BasicSet),
		[Option.KnowingYourOwnStrength]: Option.toString(Option.KnowingYourOwnStrength),
		[Option.NoSchoolGrognardDamage]: Option.toString(Option.NoSchoolGrognardDamage),
		[Option.ThrustEqualsSwingMinus2]: Option.toString(Option.ThrustEqualsSwingMinus2),
		[Option.SwingEqualsThrustPlus2]: Option.toString(Option.SwingEqualsThrustPlus2),
		[Option.Tbone1]: Option.toString(Option.Tbone1),
		[Option.Tbone1Clean]: Option.toString(Option.Tbone1Clean),
		[Option.Tbone2]: Option.toString(Option.Tbone2),
		[Option.Tbone2Clean]: Option.toString(Option.Tbone2Clean),
		[Option.PhoenixFlameD3]: Option.toString(Option.PhoenixFlameD3),
	})
}
