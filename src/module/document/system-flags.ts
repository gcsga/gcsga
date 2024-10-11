class DocumentSystemFlags<
	TDocument extends foundry.abstract.Document = foundry.abstract.Document,
	TSchema extends DocumentSystemFlagsSchema = DocumentSystemFlagsSchema,
> extends foundry.abstract.DataModel<TDocument, TSchema> {
	static override defineSchema(): DocumentSystemFlagsSchema {
		return {}
	}
}

interface DocumentSystemFlags<TDocument extends foundry.abstract.Document, TSchema extends DocumentSystemFlagsSchema>
	extends foundry.abstract.DataModel<TDocument, TSchema>,
		ModelPropsFromSchema<DocumentSystemFlagsSchema> {}

type DocumentSystemFlagsSchema = {}

export { DocumentSystemFlags, type DocumentSystemFlagsSchema }
