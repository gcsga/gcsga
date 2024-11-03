import fields = foundry.data.fields
import { ToggleableFormInputConfig } from "./helpers.ts"

class ToggleableStringField<
	TSourceProp extends string = string,
	TModelProp extends NonNullable<JSONValue> = TSourceProp,
	TRequired extends boolean = false,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.StringField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
	override toInput(
		config?: (ToggleableFormInputConfig<string> & { replacements?: Map<string, string> }) | undefined,
	): HTMLElement | HTMLCollection {
		return super.toInput(config)
	}

	protected override _toInput(
		config?: (ToggleableFormInputConfig<string> & Partial<SelectInputConfig>) | undefined,
	): HTMLElement | HTMLCollection {
		const options = !!config?.options
			? Object.values(config.options).reduce((acc: Record<string, string>, c) => {
					acc[c.value] = c.label
					return acc
				}, {})
			: Array.isArray(this.options.choices)
				? this.options.choices.reduce((acc, c) => {
						acc[c] = c
						return c
					}, {})
				: (this.options.choices as Record<string, string>)

		if (config && config.editable === false) {
			const element = document.createElement("span")
			if (options) element.innerHTML = game.i18n.localize(options[config.value])
			else element.innerHTML = config.value ?? ""
			return element
		}
		return super._toInput(config)
	}
}

export { ToggleableStringField }
