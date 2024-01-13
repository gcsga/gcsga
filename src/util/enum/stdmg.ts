import { LocalizeGURPS } from "@util/localize"

export namespace stdmg {
	export enum Option {
		None = "none",
		Thrust = "thr",
		LeveledThrust = "thr_leveled",
		Swing = "sw",
		LeveledSwing = "sw_leveled",
	}

	export namespace Option {
		export function toString(O: Option): string {
			return LocalizeGURPS.translations.gurps.enum.stdmg[O]
		}
	}

	export const Options: Option[] = [
		Option.None,
		Option.Thrust,
		Option.LeveledThrust,
		Option.Swing,
		Option.LeveledSwing,
	]
}
