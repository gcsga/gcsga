import { ActorGURPS2 } from "@module/documents/actor.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { TooltipGURPS, generateId, prereq } from "@util"
import { ActorInst } from "../actor/helpers.ts"
import { ActorType } from "../constants.ts"
import { PrereqInstances } from "./types.ts"
import fields = foundry.data.fields
import { createButton, createDummyElement } from "@module/applications/helpers.ts"
import { ItemTemplateType } from "../item/types.ts"
import { ItemDataModel } from "../item/abstract.ts"
import { BooleanSelectField } from "../item/fields/boolean-select-field.ts"

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
			has: new BooleanSelectField({
				required: true,
				nullable: true,
				choices: {
					true: "GURPS.Item.Prereqs.FIELDS.Has.Choices.true",
					false: "GURPS.Item.Prereqs.FIELDS.Has.Choices.false",
				},
				initial: true,
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
		if (has) return game.i18n.localize("GURPS.Prereq.Has")
		return game.i18n.localize("GURPS.Prereq.DoesNotHave")
	}

	get nameableReplacements(): Map<string, string> {
		return this.item.hasTemplate(ItemTemplateType.Replacement) ? this.item.system.nameableReplacements : new Map()
	}

	get element(): Handlebars.SafeString {
		const enabled: boolean = (this.item.sheet as any).editable
		return new Handlebars.SafeString(this.toFormElement(enabled).outerHTML)
	}

	constructor(data: DeepPartial<SourceFromSchema<TSchema>>, options?: PrereqConstructionOptions) {
		super(data, options)
	}

	toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.prereqs.${this.index}`

		const element = document.createElement("li")
		element.classList.add("prereq")

		element.append(createDummyElement(`${prefix}.id`, this.id))
		if (!enabled) {
			element.append(createDummyElement(`${prefix}.type`, this.type))

			if (this.has !== null) element.append(createDummyElement(`${prefix}.has`, this.has))
		}

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
				disabled: !enabled,
			}),
		)

		rowElement.append(
			foundry.applications.fields.createSelectInput({
				name: enabled ? `${prefix}.has` : "",
				value: String(this.has),
				options: [
					{ value: "true", label: "GURPS.Item.Prereqs.FIELDS.Has.Choices.true" },
					{ value: "false", label: "GURPS.Item.Prereqs.FIELDS.Has.Choices.false" },
				],
				localize: true,
				disabled: !enabled,
			}),
		)

		const typeField = this.schema.fields.type
		;(typeField as any).choices = prereq.TypesWithoutListChoices
		rowElement.append(
			typeField.toInput({
				name: enabled ? `${prefix}.type` : "",
				value: this.type,
				dataset: {
					selector: "prereq-type",
					index: this.index.toString(),
				},
				localize: true,
				disabled: !enabled,
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
	has: BooleanSelectField<boolean, boolean, true, true, true>
}

interface PrereqConstructionOptions extends DataModelConstructionOptions<ItemDataModel> {}

export { BasePrereq, type BasePrereqSchema, type PrereqConstructionOptions }
