/**
 * An implementation of the PlaceableHUD base class which renders a heads-up-display interface for Drawing objects.
 */
declare class DrawingHUD extends BasePlaceableHUD<Drawing> {}

/**
 * An implementation of the PlaceableHUD base class which renders a heads-up-display interface for Tile objects.
 */
declare class TileHUD extends BasePlaceableHUD<Tile> {}

/**
 * An implementation of the PlaceableHUD base class which renders a heads-up-display interface for Token objects.
 * This interface provides controls for visibility, attribute bars, elevation, status effects, and more.
 */
declare class TokenHUD<TToken extends Token = Token> extends BasePlaceableHUD<TToken> {
	/**
	 * Track whether the status effects control palette is currently expanded or hidden
	 * @type {boolean}
	 * @private
	 */
	protected _statusEffects: boolean

	override getData(options?: ApplicationOptions): TokenHUDData

	protected _getStatusEffectChoices(): Record<string, TokenHUDStatusEffectChoice | undefined>

	/**
	 * Assign css selectors for the active state of the status effects selection palette
	 * @param {boolean} active      Should the effects menu be active?
	 * @private
	 */
	protected _toggleStatusEffects(active: boolean): void
}

type TokenHUDData<T extends Token = Token> = BasePlaceableHUDData<T> & {
	canConfigure: boolean
	canToggleCombat: boolean
	displayBar1: boolean
	bar1Data: ReturnType<T["document"]["getBarAttribute"]>
	displayBar2: boolean
	bar2Data: ReturnType<T["document"]["getBarAttribute"]>
	visibilityClass: string
	effectsClass: string
	combatClass: string
	targetClass: string
	statusEffects: Record<string, TokenHUDStatusEffectChoice | undefined>
}

interface TokenHUDStatusEffectChoice {
	id: string
	title: string | null
	src: ImageFilePath
	isActive: boolean
	isOverlay: boolean
	cssClass: string
}
