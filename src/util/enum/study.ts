import { LocalizeGURPS } from "@util/localize.ts"
import { StringBuilder } from "@util/string-builder.ts"

export namespace study {
	export enum Type {
		Self = "self",
		Job = "job",
		Teacher = "teacher",
		Intensive = "intensive",
	}

	export namespace Type {
		export function toString(T: Type): string {
			return `GURPS.Enum.study.Type.${T}.Name`
		}

		export function multiplier(T: Type): number {
			switch (T) {
				case Type.Self:
					return 1 / 2
				case Type.Job:
					return 1 / 4
				case Type.Teacher:
					return 1
				case Type.Intensive:
					return 2
			}
		}

		export function limitations(T: Type): string[] {
			return [...LocalizeGURPS.translations.gurps.enum.study.type.limitations[T]]
		}

		export function info(T: Type): string {
			const buffer = new StringBuilder()
			const bullet = game.i18n.localize("GURPS.Tooltip.Prefix")
			for (const one of Type.limitations(T)) {
				buffer.appendToNewLine(bullet + one)
			}
			return buffer.toString()
		}
	}

	export const Types: Type[] = [Type.Self, Type.Job, Type.Teacher, Type.Intensive]

	export const TypesChoices: Readonly<Record<Type, string>> = Object.freeze(
		Types.reduce((acc: Record<string, string>, c: Type) => {
			acc[c] = `GURPS.Enum.study.Type.${c}.Name`
			return acc
		}, {}) as Record<Type, string>,
	)

	export enum Level {
		Standard = "200",
		Level1 = "180",
		Level2 = "160",
		Level3 = "140",
		Level4 = "120",
	}

	export namespace Level {
		export function toString(L: Level): string {
			return `GURPS.Enum.study.Level.${L}`
		}
	}

	export const Levels: Level[] = [Level.Standard, Level.Level1, Level.Level2, Level.Level3, Level.Level4]

	export const LevelsChoices: Readonly<Record<Level, string>> = Object.freeze(
		Levels.reduce((acc: Record<string, string>, c: Level) => {
			acc[c] = `GURPS.Enum.study.Level.${c}`
			return acc
		}, {}) as Record<Level, string>,
	)
}
