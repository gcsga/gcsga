import { ActorType } from "../constants.ts"
import { type ActorGURPS2 } from "@module/document/actor.ts"
import { type ActorDataInstances, type ActorDataTemplates, type ActorTemplateType } from "./types.ts"
import { ErrorGURPS } from "@util/misc.ts"
import { SystemDataModel } from "../abstract.ts"

/**
 * Variant of the SystemDataModel with some extra actor-specific handling.
 */
class ActorDataModel<TSchema extends ActorDataSchema = ActorDataSchema> extends SystemDataModel<ActorGURPS2, TSchema> {
	variableResolverExclusions = new Set<string>()
	cachedVariables = new Map<string, string>()

	/**
	 * Type safe way of verifying if an Actor is of a particular type.
	 */
	isOfType<T extends ActorType>(...types: T[]): this is ActorDataInstances[T] {
		return types.some(t => this.parent.type === t)
	}

	/**
	 * Type safe way of verifying if an Actor contains a template
	 */
	hasTemplate<T extends ActorTemplateType>(template: T): this is ActorDataTemplates[T] {
		return this.constructor._schemaTemplates.some(t => t.name === template)
	}

	resolveVariable(_variableName: string): string {
		throw ErrorGURPS(`ActorDataModel.resolveVariable must be implemented.`)
	}

	_prepareEmbeddedDocuments(): void {}
}

interface ActorDataModel<TSchema extends ActorDataSchema>
	extends SystemDataModel<ActorGURPS2, TSchema>,
		ModelPropsFromSchema<ActorDataSchema> {}

type ActorDataSchema = {}

export { ActorDataModel }
