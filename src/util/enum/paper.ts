import { LocalizeGURPS } from "@util/localize.ts"

export namespace paper {
	export enum Size {
		Letter = "letter",
		Legal = "legal",
		Tabloid = "tabloid",
		A0 = "a0",
		A1 = "a1",
		A2 = "a2",
		A3 = "a3",
		A4 = "a4",
		A5 = "a5",
		A6 = "a6",
	}

	export namespace Size {
		export function toString(S: Size): string {
			return LocalizeGURPS.translations.gurps.enum.paper.size[S]
		}
	}

	export enum Orientation {
		Portrait = "portrait",
		Landscape = "landscape",
	}

	export namespace Orientation {
		export function toString(O: Orientation): string {
			return LocalizeGURPS.translations.gurps.enum.paper.orientation[O]
		}
	}

	export type Length = `${number} ${"in" | "cm" | "mm"}`
}
