import { ActorGURPS, CharacterGURPS } from "@actor"
import { EffectGURPS } from "@item"
import { ManeuverID, SYSTEM_NAME } from "@data"

export class EffectPanel extends Application {
	/**
	 * Debounce and slightly delayed request to re-render this panel. necessary for situations where it is not possible
	 * to properly wait for promises to resolve before refreshing the ui.
	 */
	refresh = foundry.utils.debounce(this.render, 100)

	private get actor(): ActorGURPS | null {
		return (canvas?.tokens?.controlled[0]?.actor as ActorGURPS) ?? (game.user?.character as ActorGURPS) ?? null
	}

	protected override _injectHTML(html: JQuery<HTMLElement>): void {
		html.insertBefore($("#ui-middle").find("#ui-bottom"))
		this._element = html
	}

	static override get defaultOptions(): ApplicationOptions {
		return {
			...super.defaultOptions,
			id: "gurps-effect-panel",
			popOut: false,
			template: `systems/${SYSTEM_NAME}/templates/system/effects-panel.hbs`,
		}
	}

	override async getData(options?: Partial<ApplicationOptions> | undefined): Promise<object> {
		const { actor } = this

		if (!actor || !(actor instanceof CharacterGURPS))
			return {
				conditions: [],
				effects: [],
				actor: null,
				user: { isGM: false },
			}

		const effects = actor.gEffects.map((effect: EffectGURPS) => {
			// const duration = effect.duration.total
			// const { system } = effect
			return effect
		})

		const conditions = actor.conditions.filter(e => !Object.values(ManeuverID).includes(e.cid as ManeuverID))

		return {
			...(await super.getData(options)),
			actor,
			effects,
			conditions,
			user: { isGM: game.user?.isGM },
		}
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)

		html.find(".effect-item[data-item-id]").on("click", event => this._onEffectClick(event))
		html.find(".effect-item[data-item-id]").on("contextmenu", event => this._onEffectContextMenu(event))
	}

	private async _onEffectClick(event: JQuery.ClickEvent): Promise<EffectGURPS | undefined> {
		const effect = this.actor?.gEffects.get($(event.currentTarget).data("item-id"))
		if (!effect) return undefined

		if (effect.canLevel) return effect.increaseLevel()
		return
	}

	private async _onEffectContextMenu(event: JQuery.ContextMenuEvent): Promise<EffectGURPS | undefined> {
		const effect = this.actor?.gEffects.get($(event.currentTarget).data("item-id"))
		if (!effect) return
		if (effect.canLevel) return effect.decreaseLevel()
		else return effect.delete()
	}
}
