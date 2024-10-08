import { StringArrayField } from "./item/fields/string-array-field.ts"
import fields = foundry.data.fields
import { createButton } from "@module/applications/helpers.ts"

class RollModifier extends foundry.abstract.DataModel<foundry.abstract.DataModel, RollModifierSchema> {
	static override defineSchema(): RollModifierSchema {
		const fields = foundry.data.fields
		return {
			label: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.RollModifier.FIELDS.Label.Name",
			}),
			modifier: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				label: "GURPS.RollModifier.FIELDS.Modifier.Name",
			}),
			// Not sure what this is for, commenting out for now
			// rollType: new fields.StringField<RollType, RollType, true, true, true>({
			// 	required: true,
			// 	nullable: true,
			// 	initial: null,
			// }),
			tags: new StringArrayField({
				required: true,
				nullable: false,
				label: "GURPS.RollModifier.FIELDS.Tags.Name",
			}),
			cost: new fields.SchemaField({
				enabled: new fields.BooleanField({ required: true, nullable: false, initial: false }),
				id: new fields.StringField({ required: true, nullable: true, initial: null }),
				value: new fields.NumberField({ required: true, nullable: true, initial: null }),
			}),
			reference: new fields.StringField({ required: true, nullable: true, initial: null }),
			target: new fields.BooleanField({ required: true, nullable: true, initial: null }),
		}
	}

	static override cleanData(
		source?: (DeepPartial<SourceFromSchema<RollModifierSchema>> & Record<string, unknown>) | undefined,
		options?: Record<string, unknown> | undefined,
	): SourceFromSchema<RollModifierSchema> {
		source ??= {}
		source.cost ??= {}
		if (Object.hasOwn(source.cost, "enabled")) {
			source.cost.id = source.cost.enabled ? (source.cost.id ?? "") : null
			source.cost.value = source.cost.enabled ? (source.cost.value ?? 0) : null
		}

		return super.cleanData(source, options) as SourceFromSchema<RollModifierSchema>
	}

	get element(): Handlebars.SafeString {
		return new Handlebars.SafeString(this.toFormElement().outerHTML)
	}

	get index(): number {
		const parent = this.parent
		if (!Object.hasOwn(parent, "modifiers")) return -1

		const modifiers = (parent as unknown as { modifiers: RollModifier[] }).modifiers
		return modifiers.indexOf(this)
	}

	toFormElement(): HTMLElement {
		const prefix = `system.modifiers.${this.index}`

		const element = document.createElement("li")

		// Label and Modifier
		const rowElement1 = document.createElement("div")
		rowElement1.classList.add("form-fields")

		rowElement1.append(
			createButton({
				icon: ["fa-regular", "fa-trash"],
				label: "",
				data: {
					action: "deleteRollModifier",
					index: this.index.toString(),
				},
			}),
		)
		rowElement1.append(
			this.schema.fields.label.toInput({
				name: `${prefix}.label`,
				value: this.label,
				placeholder: game.i18n.localize(this.schema.fields.label.options.label!),
			}) as HTMLElement,
		)
		rowElement1.append(
			this.schema.fields.modifier.toInput({
				name: `${prefix}.modifier`,
				value: this.modifier.signedString(),
				placeholder: game.i18n.localize(this.schema.fields.modifier.options.label!),
			}) as HTMLElement,
		)
		element.append(rowElement1)

		const rowElement2 = document.createElement("div")
		rowElement2.classList.add("form-fields", "secondary")

		// const tagsLabel = document.createElement("label")
		// tagsLabel.innerHTML = game.i18n.localize(this.schema.fields.tags.options.label!)
		// rowElement2.append(tagsLabel)

		rowElement2.append(
			this.schema.fields.tags.toInput({
				name: `${prefix}.tags`,
				value: this.tags.join(", "),
				placeholder: game.i18n.localize(this.schema.fields.tags.options.label!),
			}) as HTMLElement,
		)
		element.append(rowElement2)

		const rowElement3 = document.createElement("div")
		rowElement3.classList.add("form-fields", "secondary")

		const costLabel = document.createElement("label")
		costLabel.innerHTML = game.i18n.localize("GURPS.RollModifier.FIELDS.Cost.Name")
		rowElement3.append(costLabel)
		rowElement3.append(
			this.schema.fields.cost.fields.enabled.toInput({
				name: `${prefix}.cost.enabled`,
				value: this.cost.enabled,
			}) as HTMLElement,
		)
		rowElement3.append(
			this.schema.fields.cost.fields.id.toInput({
				name: `${prefix}.cost.id`,
				value: this.cost.id ?? "",
				placeholder: game.i18n.localize("GURPS.RollModifier.FIELDS.Cost.Id"),
			}) as HTMLElement,
		)
		rowElement3.append(
			this.schema.fields.cost.fields.value.toInput({
				name: `${prefix}.cost.value`,
				value: this.cost.value?.toString() ?? "",
				placeholder: game.i18n.localize("GURPS.RollModifier.FIELDS.Cost.Value"),
			}) as HTMLElement,
		)
		element.append(rowElement3)

		return element
	}
}

interface RollModifier extends ModelPropsFromSchema<RollModifierSchema> {}

type RollModifierSchema = {
	// The name attached to the modifier
	label: fields.StringField<string, string, true, false, true>
	// The value of the modifier itself
	modifier: fields.NumberField<number, number, true, false, true>
	// The type of roll it is attached to. TODO: is this needed?
	// rollType: fields.StringField<RollType, RollType, true, true, true>
	// A set of tags for categorisation of the modifier
	tags: StringArrayField<true, false, true>
	// A pool attribute cost associated with the modifier
	cost: fields.SchemaField<{
		enabled: fields.BooleanField<boolean, boolean, true, false, true>
		id: fields.StringField<string, string, true, true, true>
		value: fields.NumberField<number, number, true, true, true>
	}>
	// A book reference for the modifier
	reference: fields.StringField<string, string, true, true, true>
	// TODO: what is this? is it needed?
	target: fields.BooleanField<boolean, boolean, true, true, true>
}

class RollModifierStack extends foundry.abstract.DataModel<foundry.abstract.Document, RollModifierStackSchema> {
	static override defineSchema(): RollModifierStackSchema {
		const fields = foundry.data.fields
		return {
			title: new fields.StringField({ required: true, nullable: false, initial: "" }),
			items: new fields.ArrayField(new fields.SchemaField(RollModifier.defineSchema())),
			editing: new fields.BooleanField({ required: true, nullable: true, initial: null }),
			open: new fields.BooleanField({ required: true, nullable: true, initial: null }),
		}
	}
}

interface RollModifierStack
	extends foundry.abstract.DataModel<foundry.abstract.Document, RollModifierStackSchema>,
		ModelPropsFromSchema<RollModifierStackSchema> {}

type RollModifierStackSchema = {
	title: fields.StringField<string, string, true, false, true>
	items: fields.ArrayField<fields.SchemaField<RollModifierSchema>>
	editing: fields.BooleanField<boolean, boolean, true, true, true>
	open: fields.BooleanField<boolean, boolean, true, true, true>
}

export { RollModifier, RollModifierStack, type RollModifierSchema, type RollModifierStackSchema }
