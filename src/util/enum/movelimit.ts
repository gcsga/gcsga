export namespace movelimit {
	export enum Option {
		Base = "base",
		Enhanced = "enhanced",
	}

	export namespace Option {
		export function toString(O: Option): string {
			return game.i18n.localize(`GURPS.Enum.movelimit.${O}.Name`)
		}
	}

	export const Options: Option[] = [Option.Base, Option.Enhanced]
}
