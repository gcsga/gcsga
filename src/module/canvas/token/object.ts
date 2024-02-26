import { TokenDocumentGURPS } from "@scene"

class TokenGURPS<TDocument extends TokenDocumentGURPS = TokenDocumentGURPS> extends Token<TDocument> {}

interface TokenGURPS<TDocument extends TokenDocumentGURPS = TokenDocumentGURPS> extends Token<TDocument> {
	// get layer(): TokenLayerGURPS<this>
}

export { TokenGURPS }
