import { LocalizeGURPS } from "@util/localize.ts"

export namespace encumbrance {
	export enum Level {
		No = "none",
		Light = "light",
		Medium = "medium",
		Heavy = "heavy",
		ExtraHeavy = "extra_heavy",
	}

	export namespace Level {
		export function toString(L: Level): string {
			return LocalizeGURPS.translations.gurps.enum.encumbrance[L]
		}

		export function weightMultiplier(L: Level): number {
			switch (L) {
				case Level.No:
					return 1
				case Level.Light:
					return 2
				case Level.Medium:
					return 3
				case Level.Heavy:
					return 6
				case Level.ExtraHeavy:
					return 10
				default:
					return weightMultiplier(Level.No)
			}
		}

		export function penalty(L: Level): number {
			switch (L) {
				case Level.No:
					return 0
				case Level.Light:
					return -1
				case Level.Medium:
					return -2
				case Level.Heavy:
					return -3
				case Level.ExtraHeavy:
					return -4
				default:
					return penalty(Level.No)
			}
		}
	}

	export const Levels: Level[] = [Level.No, Level.Light, Level.Medium, Level.Heavy, Level.ExtraHeavy]
}
