import { ActorGURPS2 } from "@module/document/actor.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { LocalizeGURPS, TooltipGURPS, generateId, prereq } from "@util"
import { ItemDataModel } from "../abstract.ts"
import { ActorInst } from "../actor/helpers.ts"
import { ActorType } from "../constants.ts"
import { PrereqInstances } from "./types.ts"
import fields = foundry.data.fields
import { createButton } from "@module/applications/helpers.ts"
import { ItemTemplateType } from "../item/types.ts"

abstract class BasePrereq<TSchema extends BasePrereqSchema = BasePrereqSchema> extends foundry.abstract.DataModel<
	ItemDataModel,
	TSchema
> {
	declare static TYPE: prereq.Type
	/**
	 * Type safe way of verifying if an Prereq is of a particular type.
	 */
	isOfType<T extends prereq.Type>(...types: T[]): this is PrereqInstances[T] {
		return types.some(t => this.type === t)
	}

	static override defineSchema(): BasePrereqSchema {
		const fields = foundry.data.fields

		return {
			id: new fields.StringField({ required: true, nullable: false, blank: false, initial: generateId }),
			type: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: prereq.TypesChoices,
				initial: this.TYPE,
			}),
		}
	}

	get actor(): ActorGURPS2 | null {
		return this.parent.parent.actor
	}

	get item(): ItemGURPS2 {
		return this.parent.parent
	}

	get index(): number {
		if (!this.parent.hasTemplate(ItemTemplateType.Prereq)) return -1
		return this.parent.prereqs.findIndex(e => e.id === this.id)
	}

	get hasText(): string {
		const has = (this as unknown as { has: boolean }).has ?? true
		if (has) return LocalizeGURPS.translations.GURPS.Prereq.Has
		return LocalizeGURPS.translations.GURPS.Prereq.DoesNotHave
	}

	get element(): Handlebars.SafeString {
		return new Handlebars.SafeString(this.toFormElement().outerHTML)
	}

	constructor(data: DeepPartial<SourceFromSchema<TSchema>>, options?: PrereqConstructionOptions) {
		super(data, options)
	}

	toFormElement(): HTMLElement {
		const element = document.createElement("li")
		const prefix = `system.prereqs.${this.index}`
		// Root element
		element.classList.add("prereq")

		const idInput = this.schema.fields.id.toInput({
			name: `${prefix}.id`,
			value: this.id,
			readonly: true,
		}) as HTMLElement
		idInput.style.setProperty("display", "none")
		element.append(idInput)

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields")

		rowElement.append(
			createButton({
				icon: ["fa-regular", "fa-trash"],
				label: "",
				data: {
					action: "deletePrereq",
					id: this.id,
				},
			}),
		)

		rowElement.append(
			(this.schema.fields as any).has.toInput({
				name: `${prefix}.has`,
				value: (this as any).has,
				localize: true,
			}) as HTMLElement,
		)
		const typeField = this.schema.fields.type
		;(typeField as any).choices = prereq.TypesWithoutListChoices

		rowElement.append(
			typeField.toInput({
				name: `${prefix}.type`,
				value: this.type,
				dataset: {
					selector: "prereq-type",
					index: this.index.toString(),
				},
				localize: true,
			}) as HTMLElement,
		)

		element.append(rowElement)

		return element
	}

	abstract satisfied(
		actor: ActorInst<ActorType.Character>,
		exclude: unknown,
		tooltip: TooltipGURPS | null,
		...args: unknown[]
	): boolean

	abstract fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void
}

interface BasePrereq<TSchema extends BasePrereqSchema>
	extends foundry.abstract.DataModel<ItemDataModel, TSchema>,
		ModelPropsFromSchema<BasePrereqSchema> {
	consturctor: typeof BasePrereq<TSchema>
}

type BasePrereqSchema = {
	id: fields.StringField<string, string, true, false, true>
	type: fields.StringField<prereq.Type, prereq.Type, true, false, true>
}

interface PrereqConstructionOptions extends DataModelConstructionOptions<ItemDataModel> {}

export { BasePrereq, type BasePrereqSchema, type PrereqConstructionOptions }
