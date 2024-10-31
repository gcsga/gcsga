import { ToggleableFormInputConfig } from "./helpers.ts"
import fields = foundry.data.fields

class ToggleableStringField<
	TSourceProp extends string = string,
	TModelProp extends NonNullable<JSONValue> = TSourceProp,
	TRequired extends boolean = false,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.StringField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
	protected override _toInput(config?: ToggleableFormInputConfig<string> | undefined): HTMLElement | HTMLCollection {
		if (config && config.editable === false) {
			const element = document.createElement("span")
			element.innerHTML = config.value ?? ""
			return element
		}
		return super._toInput(config)
	}
}

export { ToggleableStringField }
