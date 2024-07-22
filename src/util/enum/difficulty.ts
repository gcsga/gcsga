import { LocalizeGURPS } from "@util/localize.ts"
import { equalFold } from "@module/util/string-criteria.ts"

export namespace difficulty {
	export enum Level {
		Easy = "e",
		Average = "a",
		Hard = "h",
		VeryHard = "vh",
		Wildcard = "w",
	}

	export namespace Level {
		export function ensureValid(L: Level): Level {
			if (Levels.includes(L)) return L
			return Levels[0]
		}

		export function toString(L: Level): string {
			return LocalizeGURPS.translations.gurps.enum.difficulty[L]
		}

		export function baseRelativeLevel(L: Level): number {
			switch (L) {
				case Level.Easy:
					return 0
				case Level.Average:
					return -1
				case Level.Hard:
					return -2
				case Level.VeryHard:
				case Level.Wildcard:
					return -3
			}
		}

		export function extractLevel(s: string): Level {
			for (const one of Levels) {
				if (equalFold(one, s)) return one
			}
			return Levels[0]
		}
	}

	export const Levels: Level[] = [Level.Easy, Level.Average, Level.Hard, Level.VeryHard, Level.Wildcard]

	export const TechniqueLevels = [Level.Average, Level.Hard] as const
}
