import { SystemDataModel } from "@module/data/abstract.ts"
import { cell, align } from "@util"
import fields = foundry.data.fields

class CellData extends foundry.abstract.DataModel<SystemDataModel, CellDataSchema> {
	static override defineSchema(): CellDataSchema {
		const fields = foundry.data.fields
		return {
			type: new fields.StringField({
				required: true,
				nullable: false,
				choices: cell.Types,
				initial: cell.Type.Text,
			}),
			disabled: new fields.BooleanField({ required: true, nullable: true, initial: null }),
			dim: new fields.BooleanField({ required: true, nullable: true, initial: null }),
			checked: new fields.BooleanField({ required: true, nullable: true, initial: null }),
			alignment: new fields.StringField({
				required: true,
				nullable: false,
				choices: align.Options,
				initial: align.Option.Start,
			}),
			primary: new fields.StringField({ required: true, nullable: true, initial: null }),
			secondary: new fields.StringField({ required: true, nullable: true, initial: null }),
			tooltip: new fields.StringField({ required: true, nullable: true, initial: null }),
			unsatisfiedReason: new fields.StringField({ required: true, nullable: true, initial: null }),
			templateInfo: new fields.StringField({ required: true, nullable: true, initial: null }),
			inlineTag: new fields.StringField({ required: true, nullable: true, initial: null }),
		}
	}

	get element(): Handlebars.SafeString {
		return new Handlebars.SafeString(this.toFormElement().outerHTML)
	}

	toFormElement(): HTMLElement {
		const element = document.createElement("div")
		if (this.type === cell.Type.Toggle) {
			if (this.checked) element.innerHTML = "X"
		}
		if (this.type === cell.Type.Text) {
			element.innerHTML = this.primary ?? ""
		}

		return element
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
}

export { CellData }
