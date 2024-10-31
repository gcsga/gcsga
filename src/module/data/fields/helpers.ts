interface ToggleableFormInputConfig<TValue extends string | boolean = string | boolean>
	extends FormInputConfig<TValue> {
	editable?: boolean
}

export { type ToggleableFormInputConfig }
