import { LocalizeGURPS } from "@util/localize"

export namespace stlimit {
	export enum Option {
		None = "none",
		StrikingOnly = "striking_only",
		LiftingOnly = "lifting_only",
		ThrowingOnly = "throwing_only",
	}

	export namespace Option {
		export function toString(O: Option): string {
			return LocalizeGURPS.translations.gurps.enum.stlimit[O]
		}
	}

	export const Options: Option[] = [Option.None, Option.StrikingOnly, Option.LiftingOnly, Option.ThrowingOnly]
}
