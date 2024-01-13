import { LocalizeGURPS } from "@util/localize"

export namespace display {
	export enum Option {
		NotShown = "not_shown",
		Inline = "inline",
		Tooltip = "tooltip",
		InlineAndTooltip = "inline_and_tooltip",
	}

	export namespace Option {
		export function toString(O: Option): string {
			return LocalizeGURPS.translations.gurps.enum.display[O]
		}

		export function isInline(O: Option): boolean {
			return O === Option.Inline || O === Option.InlineAndTooltip
		}

		export function isTooltip(O: Option): boolean {
			return O === Option.Tooltip || O === Option.InlineAndTooltip
		}
	}

	export const Options: Option[] = [Option.NotShown, Option.Inline, Option.Tooltip, Option.InlineAndTooltip]
}
