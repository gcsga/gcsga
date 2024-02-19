export const CanvasUtil = {
	/**
	 * @param point location to "search" for Tokens.
	 * @param point.x the x coordinate.
	 * @param point.y the y coordinate.
	 * @returns {Token[]} the Set of tokens found.
	 */
	getCanvasTokensAtPosition: function (canvas: Canvas, point: { x: number; y: number }): Token[] {
		const dropTargets = [...canvas.tokens!.placeables]
			.sort((a, b) => b.document.sort - a.document.sort)
			.filter(token => {
				const maximumX = token.x + (token.hitArea?.right ?? 0)
				const maximumY = token.y + (token.hitArea?.bottom ?? 0)
				return point.x >= token.x && point.y >= token.y && point.x <= maximumX && point.y <= maximumY
			})
		return dropTargets
	},
}
