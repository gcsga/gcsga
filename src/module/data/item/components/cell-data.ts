import { SystemDataModel } from "@module/data/abstract.ts"
import { cell, align } from "@util"
import fields = foundry.data.fields

type CellDataOptions = {
	sheet?: string
}

class CellData extends foundry.abstract.DataModel<SystemDataModel, CellDataSchema> {
	static override defineSchema(): CellDataSchema {
		const fields = foundry.data.fields
		return {
			// The type of cell determines several display values
			type: new fields.StringField({
				required: true,
				nullable: false,
				choices: cell.Types,
				initial: cell.Type.Text,
			}),
			// Determines whether the cell is struck through
			disabled: new fields.BooleanField({ required: true, nullable: true, initial: null }),
			// Determiens whether the cell is dimmed out
			dim: new fields.BooleanField({ required: true, nullable: true, initial: null }),
			// [Type.Toggle Only] deterines if cell is checked
			checked: new fields.BooleanField({ required: true, nullable: true, initial: null }),
			// Alignemnt [Start|Middle|End|Fill]
			alignment: new fields.StringField({
				required: true,
				nullable: false,
				choices: align.Options,
				initial: align.Option.Start,
			}),
			// Primary Text displayed prominently
			primary: new fields.StringField({ required: true, nullable: true, initial: null }),
			// Secondary Text displayed as notes
			secondary: new fields.StringField({ required: true, nullable: true, initial: null }),
			// Text displayed in tooltip
			tooltip: new fields.StringField({ required: true, nullable: true, initial: null }),
			// Unsatisfied reason displayed as tag
			unsatisfiedReason: new fields.StringField({ required: true, nullable: true, initial: null }),
			// [Template Picker fields only]: template info displayed as tag
			templateInfo: new fields.StringField({ required: true, nullable: true, initial: null }),
			// Tag displayed inline with primary text (e.g. Trait Container type)
			inlineTag: new fields.StringField({ required: true, nullable: true, initial: null }),
			// Classes to add to field
			classList: new fields.ArrayField(
				new fields.StringField({ required: true, nullable: false, blank: false }),
				{ required: true, nullable: false, initial: [] },
			),
			// Condition which determines whether the cell should be displayed
			condition: new fields.BooleanField({ required: true, nullable: false, initial: true }),
		}
	}

	get element(): Handlebars.SafeString {
		return new Handlebars.SafeString(this.toFormElement()?.outerHTML ?? "")
	}

	toFormElement(): HTMLElement | null {
		if (!this.condition) return null
		const element = document.createElement(this._getElementType())
		this._getFormValuesForType(element)
		element.style.setProperty("align-self", this._getAlignment())
		element.classList.add("item-detail", ...this.classList)
		return element
	}

	private _getElementType(): string {
		switch (this.type) {
			case cell.Type.Toggle:
				return "a"
			default:
				return "div"
		}
	}

	private _getAlignment(): string {
		switch (this.alignment) {
			case align.Option.Start:
				return "flex-start"
			case align.Option.Middle:
				return "flex-middle"
			case align.Option.End:
				return "flex-end"
			case align.Option.Fill:
				return "flex-stretch"
		}
	}

	private _getFormValuesForType(element: HTMLElement): void {
		switch (this.type) {
			case cell.Type.Toggle: {
				element.classList.add("fa-solid", "fa-check")
				if (this.checked) element.classList.add("enabled")
				element.dataset.action = "toggleCheckbox"
				return
			}
			case cell.Type.Text:
			case cell.Type.Tags: {
				element.innerHTML = this.primary ?? ""
				return
			}
			case cell.Type.PageRef: {
				element.innerHTML = this.primary ?? ""
				return
			}
		}
	}
}

interface CellData
	extends foundry.abstract.DataModel<SystemDataModel, CellDataSchema>,
		ModelPropsFromSchema<CellDataSchema> {}

type CellDataSchema = {
	type: fields.StringField<cell.Type, cell.Type, true, false, true>
	disabled: fields.BooleanField<boolean, boolean, true, true, true>
	dim: fields.BooleanField<boolean, boolean, true, true, true>
	checked: fields.BooleanField<boolean, boolean, true, true, true>
	alignment: fields.StringField<align.Option, align.Option, true, false, true>
	primary: fields.StringField<string, string, true, true, true>
	secondary: fields.StringField<string, string, true, true, true>
	tooltip: fields.StringField<string, string, true, true, true>
	unsatisfiedReason: fields.StringField<string, string, true, true, true>
	templateInfo: fields.StringField<string, string, true, true, true>
	inlineTag: fields.StringField<string, string, true, true, true>
	classList: fields.ArrayField<
		fields.StringField<string, string, true, false, true>,
		string[],
		string[],
		true,
		false,
		true
	>
	condition: fields.BooleanField<boolean, boolean, true, false, true>
}

export { CellData, type CellDataOptions }
