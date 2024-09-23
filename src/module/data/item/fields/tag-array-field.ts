import fields = foundry.data.fields

class TagArrayField extends fields.ArrayField<fields.StringField<string, string, true, false, true>> {
	protected override _toInput(config: FormInputConfig<string>): HTMLElement | HTMLCollection {
		config.value = (config.value as unknown as string[]).join(", ")
		return foundry.applications.fields.createTextInput(config)
	}

	override clean(value: unknown, options?: fields.CleanFieldOptions | undefined): string[] {
		function onlyUnique(value: string, index: number, array: string[]) {
			return array.indexOf(value) === index && value !== ""
		}

		if (Array.isArray(value)) {
			value = value
				.join(",")
				.split(",")
				.map((e: string) => e.trim())
				.filter((v, i, a) => onlyUnique(v, i, a))
		} else if (typeof value === "string") {
			value = value
				.split(",")
				.map((e: string) => e.trim())
				.filter((v, i, a) => onlyUnique(v, i, a))
		}
		return super.clean(value, options)
	}
}

export { TagArrayField }
