import { LocalizeGURPS } from "@util/localize.ts"

export namespace movelimit {
	export enum Option {
		Base = "base",
		Enhanced = "enhanced",
	}

	export namespace Option {
		export function toString(O: Option): string {
			return LocalizeGURPS.translations.gurps.enum.movelimit[O]
		}
	}

	export const Options: Option[] = [Option.Base, Option.Enhanced]
}
