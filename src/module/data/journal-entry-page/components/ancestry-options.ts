import { createButton } from "@module/applications/helpers.ts"
import { VariableResolver, evaluateToNumber } from "@module/util/index.ts"
import { Length, Weight } from "@util"
import { AncestryData } from "../ancestry.ts"
import fields = foundry.data.fields

const DEFAULTS = {
	HEIGHT: 64,
	WEIGHT: 140,
	AGE: 18,
	HAIR: "Brown",
	EYE: "Brown",
	SKIN: "Brown",
	HANDEDNESS: "Right",
	MAXIMUM_RANDOM_TRIES: 5,
}

enum WeightedStringOptionType {
	Hair = "hair_options",
	Eye = "eye_options",
	Skin = "skin_options",
	Handedness = "handedness_options",
}

const WeightedStringOptionTypes = [
	WeightedStringOptionType.Hair,
	WeightedStringOptionType.Eye,
	WeightedStringOptionType.Skin,
	WeightedStringOptionType.Handedness,
]

class AncestryOptions extends foundry.abstract.DataModel<AncestryData | WeightedAncestryOption, AncestryOptionsSchema> {
	static override defineSchema(): AncestryOptionsSchema {
		const fields = foundry.data.fields

		return {
			name: new fields.StringField({
				required: true,
				nullable: true,
				initial: "",
				label: "GURPS.JournalEntryPage.Ancestry.FIELDS.Name.Name",
			}),
			height_formula: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.JournalEntryPage.Ancestry.FIELDS.HeightFormula.Name",
			}),
			weight_formula: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.JournalEntryPage.Ancestry.FIELDS.WeightFormula.Name",
			}),
			age_formula: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.JournalEntryPage.Ancestry.FIELDS.AgeFormula.Name",
			}),
			hair_options: new fields.ArrayField(
				new fields.EmbeddedDataField(WeightedStringOption, {
					initial: { type: WeightedStringOptionType.Hair, weight: 1, value: "" },
				}),
				{
					label: "GURPS.JournalEntryPage.Ancestry.FIELDS.HairOptions.Name",
				},
			),
			eye_options: new fields.ArrayField(
				new fields.EmbeddedDataField(WeightedStringOption, {
					initial: { type: WeightedStringOptionType.Eye, weight: 1, value: "" },
				}),
				{
					label: "GURPS.JournalEntryPage.Ancestry.FIELDS.EyeOptions.Name",
				},
			),
			skin_options: new fields.ArrayField(
				new fields.EmbeddedDataField(WeightedStringOption, {
					initial: { type: WeightedStringOptionType.Skin, weight: 1, value: "" },
				}),
				{
					label: "GURPS.JournalEntryPage.Ancestry.FIELDS.SkinOptions.Name",
				},
			),
			handedness_options: new fields.ArrayField(
				new fields.EmbeddedDataField(WeightedStringOption, {
					initial: { type: WeightedStringOptionType.Handedness, weight: 1, value: "" },
				}),
				{
					label: "GURPS.JournalEntryPage.Ancestry.FIELDS.HandednessOptions.Name",
				},
			),
			name_generators: new fields.ArrayField(
				new fields.ForeignDocumentField(RollTable, {
					required: true,
					nullable: true,
					idOnly: true,
				}),
				{
					label: "GURPS.JournalEntryPage.Ancestry.FIELDS.NameGenerators.Name",
				},
			),
		}
	}

	get path(): string {
		const parent = this.parent
		if (parent instanceof AncestryData) return `system.common_options`
		else {
			return `system.gender_options.${this.index}.value`
		}
	}

	get index(): number {
		if (this.parent instanceof AncestryData) return -1
		return (this.parent.parent as AncestryData).gender_options.indexOf(this.parent as WeightedAncestryOption)
	}

	get nameGenerators(): RollTable[] {
		const generators: RollTable[] = []
		for (const id of this.name_generators) {
			if (id === null) continue
			const table = game.tables.get(id)
			if (!table) continue
			generators.push(table)
		}
		return generators
	}

	get generatorAnchors(): Handlebars.SafeString[] {
		return this.nameGenerators.map(e => new Handlebars.SafeString(e.toAnchor().outerHTML))
	}

	randomHeight(resolver: VariableResolver, not: number): number {
		const def = Length.toInches(DEFAULTS.HEIGHT, Length.Unit.Inch)
		for (let i = 0; i < DEFAULTS.MAXIMUM_RANDOM_TRIES; i++) {
			let value = evaluateToNumber(this.height_formula, resolver)
			if (value <= 0) value = def
			if (value !== not) return value
		}
		return def
	}

	randomWeight(resolver: VariableResolver, not: number): number {
		const def = Weight.toPounds(DEFAULTS.WEIGHT, Weight.Unit.Pound)
		for (let i = 0; i < DEFAULTS.MAXIMUM_RANDOM_TRIES; i++) {
			let value = evaluateToNumber(this.weight_formula, resolver)
			if (value <= 0) value = def
			if (value !== not) return value
		}
		return def
	}

	randomAge(resolver: VariableResolver, not: number): number {
		for (let i = 0; i < DEFAULTS.MAXIMUM_RANDOM_TRIES; i++) {
			let value = evaluateToNumber(this.age_formula, resolver)
			if (value <= 0) value = DEFAULTS.AGE
			if (value !== not) return value
		}
		return DEFAULTS.AGE
	}

	randomHair(not: string): string {
		const choice = WeightedStringOption.choose(this.hair_options, not)
		if (choice !== "") return choice
		return DEFAULTS.HAIR
	}

	randomEye(not: string): string {
		const choice = WeightedStringOption.choose(this.eye_options, not)
		if (choice !== "") return choice
		return DEFAULTS.EYE
	}
	randomSkin(not: string): string {
		const choice = WeightedStringOption.choose(this.skin_options, not)
		if (choice !== "") return choice
		return DEFAULTS.SKIN
	}
	randoHandedness(not: string): string {
		const choice = WeightedStringOption.choose(this.handedness_options, not)
		if (choice !== "") return choice
		return DEFAULTS.HANDEDNESS
	}

	async randomName(): Promise<string> {
		const names: string[] = []
		for (const generator of this.nameGenerators) {
			const result = (await generator?.draw())?.results[0] ?? null
			if (result === null) continue
			if (result.type !== foundry.CONST.TABLE_RESULT_TYPES.TEXT) {
				ui.notifications.error("Drawn name result is not text.")
			}
			names.push(result.text)
		}

		return names.join("")
	}
}

class WeightedStringOption extends foundry.abstract.DataModel<AncestryOptions, WeightedStringOptionSchema> {
	constructor(
		data?: DeepPartial<SourceFromSchema<WeightedStringOptionSchema>>,
		options?: DataModelConstructionOptions<AncestryOptions>,
	) {
		super(data, options)
	}

	static override defineSchema(): WeightedStringOptionSchema {
		const fields = foundry.data.fields
		return {
			type: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: WeightedStringOptionTypes,
			}),
			weight: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			value: new fields.StringField({ required: true, nullable: false, initial: "" }),
		}
	}

	static choose(options: WeightedStringOption[], not: string): string {
		let total = 0
		for (const one of options) {
			if (one.value !== not) total += one.weight
		}
		if (total > 0) {
			let choice = 1 + Math.trunc(Math.random() * total)
			for (const one of options) {
				if (one.value !== not) continue
				choice -= one.weight
				if (choice < 1) return one.value
			}
		}
		return ""
	}

	get array(): WeightedStringOption[] {
		return this.parent[this.type]
	}

	get index(): number {
		return this.array.indexOf(this)
	}

	get element(): Handlebars.SafeString {
		return new Handlebars.SafeString(this.toFormElement().outerHTML)
	}

	get path(): string {
		return `${this.parent.path}.${this.type}`
	}

	toFormElement(): HTMLElement {
		const element = document.createElement("li")
		const path = this.path
		const index = this.index

		const typeField = foundry.applications.fields.createTextInput({
			name: `${path}.${index}.type`,
			value: this.type,
			readonly: true,
		})
		typeField.style.setProperty("display", "none")
		element.append(typeField)

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields")

		rowElement.append(
			createButton({
				icon: ["fa-regular", "fa-trash"],
				label: "",
				data: {
					action: "deleteStringOption",
					path,
					index: index.toString(),
				},
			}),
		)

		rowElement.append(
			this.schema.fields.weight.toInput({
				name: `${path}.${index}.weight`,
				value: this.weight.toString(),
				localize: true,
				placeholder: game.i18n.localize(
					game.i18n.localize("GURPS.JournalEntryPage.Ancestry.FIELDS.Weight.Name"),
				),
			}) as HTMLElement,
		)

		rowElement.append(
			this.schema.fields.value.toInput({
				name: `${path}.${index}.value`,
				value: this.value.toString(),
				localize: true,
				placeholder: game.i18n.localize(
					game.i18n.localize("GURPS.JournalEntryPage.Ancestry.FIELDS.Value.Name"),
				),
			}) as HTMLElement,
		)

		element.append(rowElement)
		return element
	}
}

class WeightedAncestryOption extends foundry.abstract.DataModel<AncestryData, WeightedAncestryOptionsSchema> {
	static override defineSchema(): WeightedAncestryOptionsSchema {
		const fields = foundry.data.fields
		return {
			weight: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				label: "GURPS.JournalEntryPage.Ancestry.FIELDS.Weight.Name",
			}),
			value: new fields.EmbeddedDataField(AncestryOptions),
		}
	}
}

interface AncestryOptions extends ModelPropsFromSchema<AncestryOptionsSchema> {}
interface WeightedAncestryOption extends ModelPropsFromSchema<WeightedAncestryOptionsSchema> {}
interface WeightedStringOption extends ModelPropsFromSchema<WeightedStringOptionSchema> {}

type AncestryOptionsSchema = {
	name: fields.StringField<string, string, true, true, true>
	height_formula: fields.StringField<string, string, true, false, true>
	weight_formula: fields.StringField<string, string, true, false, true>
	age_formula: fields.StringField<string, string, true, false, true>
	hair_options: fields.ArrayField<fields.EmbeddedDataField<WeightedStringOption>>
	eye_options: fields.ArrayField<fields.EmbeddedDataField<WeightedStringOption>>
	skin_options: fields.ArrayField<fields.EmbeddedDataField<WeightedStringOption>>
	handedness_options: fields.ArrayField<fields.EmbeddedDataField<WeightedStringOption>>
	name_generators: fields.ArrayField<fields.ForeignDocumentField<string, true, true, true>>
}

type WeightedAncestryOptionsSchema = {
	weight: fields.NumberField<number, number, true, false, true>
	value: fields.EmbeddedDataField<AncestryOptions>
}

type WeightedStringOptionSchema = {
	type: fields.StringField<WeightedStringOptionType, WeightedStringOptionType, true, false, true>
	weight: fields.NumberField<number, number, true, false, true>
	value: fields.StringField<string, string, true, false, true>
}

export {
	AncestryOptions,
	WeightedAncestryOption,
	WeightedStringOption,
	type AncestryOptionsSchema,
	type WeightedAncestryOptionsSchema,
	type WeightedStringOptionSchema,
	type WeightedStringOptionType,
}
