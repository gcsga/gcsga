export namespace stdmg {
	export enum Option {
		None = "none",
		Thrust = "thr",
		LiftingThrust = "lift_thr",
		TelekineticThrust = "tk_thr",
		Swing = "sw",
		LiftingSwing = "lift_sw",
		TelekineticSwing = "tk_sw",
		// OldLeveledThrust = "thr_leveled",
		// OldLeveledSwing = "sw_leveled",
	}

	export namespace Option {
		export function toString(O: Option): string {
			return `GURPS.Enum.stdmg.${O}`
		}

		export function toStringLeveled(O: Option): string {
			return game?.i18n?.format("GURPS.Enum.stdmg.Leveled", { value: `GURPS.Enum.stdmg.${O}` })
		}
	}

	export const Options: Option[] = [
		Option.None,
		Option.Thrust,
		Option.LiftingThrust,
		Option.TelekineticThrust,
		Option.Swing,
		Option.LiftingSwing,
		Option.TelekineticSwing,
		// Option.LeveledThrust,
		// Option.LeveledSwing,
	]

	export const OptionsChoices: Readonly<Record<Option, string>> = Object.freeze(
		Object.fromEntries(Options.map(O => [O, Option.toString(O)])) as Record<Option, string>,
	)
}
