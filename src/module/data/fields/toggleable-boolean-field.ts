import { ToggleableFormInputConfig } from "./helpers.ts"
import fields = foundry.data.fields

class ToggleableBooleanField<
	TSourceProp extends boolean = boolean,
	TModelProp extends NonNullable<JSONValue> = TSourceProp,
	TRequired extends boolean = false,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.BooleanField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
	protected override _toInput(config?: ToggleableFormInputConfig<string> | undefined): HTMLElement | HTMLCollection {
		if (config && !config.editable) {
			return super._toInput({ ...config, disabled: true })
		}
		return super._toInput(config)
	}
}

export { ToggleableBooleanField }
