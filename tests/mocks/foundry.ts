// interface DataModelConstructionOptions<TParent extends DataModel | null> {
// 	/** A parent DataModel instance to which this DataModel belongs */
// 	parent?: TParent
// 	/** Control the strictness of validation for initially provided data */
// 	strict?: boolean
// 	/** Attempt to replace invalid values with valid defaults? */
// 	fallback?: boolean
// 	/** Allow partial source data, ignoring absent fields? */
// 	partial?: boolean
// 	[key: string]: unknown
// }
//
// class DataModel<TSchema extends object = object, TParent extends DataModel | null = null> {
// 	constructor(
// 		data: TSchema = {},
// 		options: DataModelConstructionOptions<TParent> = { parent: null, strict: true },
// 	) {
// 		// Parent model
// 		Object.defineProperty(this, "parent", {
// 			value: (() => {
// 				if (options.parent === null) return null
// 				if (options.parent instanceof DataModel) return options.parent
// 				throw new Error("The provided parent must be a DataModel instance")
// 			})(),
// 			writable: false,
// 			enumerable: false,
// 		})
//
// 		Object.assign(this, data)
// 	}
//
// 	toObject(): object {
// 		return { ...this }
// 	}
// }
//
// export const mockFoundry = {
// 	abstract: {
// 		DataModel,
// 		TypeDataModel: DataModel,
// 	},
// 	data: {
// 		fields: {
// 			BooleanField: class {},
// 			StringField: class {},
// 			NumberField: class {},
// 			ArrayField: class {},
// 			SchemaField: class {},
// 			ObjectField: class {},
// 			DataField: class {},
// 		},
// 	},
// }
