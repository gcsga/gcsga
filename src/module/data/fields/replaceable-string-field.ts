import { Nameable } from "@module/util/nameable.ts"
import { ToggleableStringField } from "./toggleable-string-fields.ts"
import { ToggleableFormInputConfig } from "./helpers.ts"

class ReplaceableStringField<
	TSourceProp extends string = string,
	TModelProp extends NonNullable<JSONValue> = TSourceProp,
	TRequired extends boolean = false,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends ToggleableStringField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
	override toInput(
		config?: (ToggleableFormInputConfig<string> & { replacements?: Map<string, string> }) | undefined,
	): HTMLElement | HTMLCollection {
		return super.toInput(config)
	}

	protected override _toInput(
		config?: (ToggleableFormInputConfig<string> & { replacements?: Map<string, string> }) | undefined,
	): HTMLElement | HTMLCollection {
		if (config && !config.editable && config?.replacements) {
			config.value = Nameable.applyToElement(config.value, config.replacements)
		}
		return super._toInput(config)
	}
}

export { ReplaceableStringField }
