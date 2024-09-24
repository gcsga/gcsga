import { ActorGURPS2 } from "@module/document/actor.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { LocalizeGURPS, TooltipGURPS, generateId, prereq } from "@util"
import { ItemDataModel } from "../abstract.ts"
import { ActorInst } from "../actor/helpers.ts"
import { ActorType } from "../constants.ts"
import { PrereqTemplate } from "../item/templates/prereqs.ts"
import { PrereqInstances } from "./types.ts"
import fields = foundry.data.fields

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
		return (this.parent as unknown as PrereqTemplate).prereqs.findIndex(e => e.id === this.id)
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

	abstract toFormElement(): HTMLElement

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
