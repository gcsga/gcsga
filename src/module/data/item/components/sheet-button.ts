import { RecordField } from "@module/data/fields/record-field.ts"
import fields = foundry.data.fields
import { SystemDataModel } from "@module/data/abstract.ts"

class SheetButton extends foundry.abstract.DataModel<SystemDataModel, SheetButtonSchema> {
	static override defineSchema(): SheetButtonSchema {
		const fields = foundry.data.fields

		return {
			tag: new fields.StringField({ required: true, nullable: false, initial: "a" }),
			classList: new fields.ArrayField(new fields.StringField({ required: true, nullable: false, initial: "" }), {
				required: true,
				nullable: false,
			}),
			name: new fields.StringField({ required: true, nullable: true, initial: null }),
			action: new fields.StringField({ required: true, nullable: false, initial: "" }),
			dataset: new RecordField(
				new fields.StringField({ required: true, nullable: false }),
				new fields.StringField({ required: true, nullable: false, initial: "" }),
				{ required: true, nullable: false },
			),
			permission: new fields.NumberField({
				required: true,
				nullable: false,
				choices: Object.values(foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS),
				initial: foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,
			}),
		}
	}

	get element(): Handlebars.SafeString {
		return new Handlebars.SafeString(this.toFormElement()?.outerHTML ?? "")
	}

	get document(): foundry.abstract.Document | null {
		return this.parent.parent
	}

	toFormElement(): HTMLElement {
		const element = document.createElement(this.tag)

		if (this.permission !== foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE) {
			if (!this.document?.testUserPermission(game.user, this.permission)) element.setAttribute("disabled", "")
		}

		element.classList.add(...this.classList)
		if (this.name) element.innerHTML = this.name
		Object.entries(this.dataset).forEach(([key, value]) => {
			element.dataset[key] = value
		})
		element.dataset.action = this.action
		return element
	}
}

interface SheetButton extends ModelPropsFromSchema<SheetButtonSchema> {}

type SheetButtonSchema = {
	tag: fields.StringField<string, string, true, false, true>
	classList: fields.ArrayField<
		fields.StringField<string, string, true, false, true>,
		string[],
		string[],
		true,
		false,
		true
	>
	name: fields.StringField<string, string, true, true, true>
	action: fields.StringField<string, string, true, false, true>
	dataset: RecordField<
		fields.StringField<string, string, true, false, false>,
		fields.StringField<string, string, true, false, true>,
		true,
		false,
		true
	>
	permission: fields.NumberField<DocumentOwnershipLevel, DocumentOwnershipLevel, true, false, true>
}

export { SheetButton, type SheetButtonSchema }
