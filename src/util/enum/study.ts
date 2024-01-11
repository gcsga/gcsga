import { LocalizeGURPS } from "@util/localize"

export namespace study {
	export enum Type {
		Self = "self",
		Job = "job",
		Teacher = "teacher",
		Intensive = "intensive",
	}

	export namespace Type {
		export function toString(T: Type): string {
			return LocalizeGURPS.translations.gurps.enum.study.type.string[T]
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
	}

	export const Types: Type[] = [Type.Self, Type.Job, Type.Teacher, Type.Intensive]

	export enum Level {
		Standard = "",
		Level1 = "180",
		Level2 = "160",
		Level3 = "140",
		Level4 = "120",
	}

	export namespace Level {}

	export const Levels: Level[] = [Level.Standard, Level.Level1, Level.Level2, Level.Level3, Level.Level4]
}
