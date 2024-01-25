import { ActorGURPS } from "@module/config"
import { RollModifier, RollModifierTags, SETTINGS, SYSTEM_NAME, UserFlags } from "@module/data"
import { UserGURPS } from "@module/user/document"
import { LastActor } from "@util"

class ModifierList extends Application {
	_tempRangeMod: RollModifier = { name: "", modifier: 0, tags: [RollModifierTags.Range] }

	static get defaultOptions(): ApplicationOptions {
		return mergeObject(super.defaultOptions, {
			popOut: false,
			minimizable: false,
			resizable: false,
			id: "ModifierList",
			template: `systems/${SYSTEM_NAME}/templates/modifier-list/list.hbs`,
			classes: ["modifier-list"],
		})
	}

	get collapse(): boolean {
		const collapse = game.settings.get(SYSTEM_NAME, SETTINGS.MODIFIER_LIST_COLLAPSE)
		const button_open = game.ModifierBucket.window.rendered
		if (collapse && !button_open) return true
		return false
	}

	private get _bottom(): string {
		const bottom = Math.max($("body").height()! - $("#players").position().top, 64)
		return `bottom: ${bottom}px`
	}

	async getData(options?: Partial<ApplicationOptions> | undefined): Promise<object> {
		const currentMods = game.user?.getFlag(SYSTEM_NAME, UserFlags.ModifierStack)
		let targetMods: RollModifier[] = []
		const actor = (game.user?.isGM ? await LastActor.get() : game.user?.character) as ActorGURPS
		game.user?.targets.forEach(e => {
			targetMods = targetMods.concat((e.actor as ActorGURPS).modifiers)
		})
		let actorMods = actor?.modifiers

		return mergeObject(super.getData(options), {
			currentMods,
			targetMods,
			actorMods,
			collapse: this.collapse,
			bottom: this._bottom,
		})
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find(".active").on("click", event => this.removeModifier(event))
		html.find(".modifier").on("click", event => this._onClickModifier(event))
		html.find(".collapse-toggle").on("click", event => this._onCollapseToggle(event))
	}

	protected _injectHTML(html: JQuery<HTMLElement>): void {
		if ($("body").find("#modifier-list").length === 0) {
			html.insertBefore($("body").find("#players"))
			this._element = html
		}
	}

	_onClickModifier(event: JQuery.ClickEvent) {
		event.preventDefault()
		const modifier: RollModifier = {
			name: $(event.currentTarget).data("name"),
			modifier: $(event.currentTarget).data("modifier"),
		}
		return (game.user as UserGURPS).addModifier(modifier)
	}

	_onCollapseToggle(event: JQuery.ClickEvent) {
		event.preventDefault()
		game.settings.set(SYSTEM_NAME, SETTINGS.MODIFIER_LIST_COLLAPSE, !this.collapse)
		return this.render(true)
	}

	setRangeMod(mod: RollModifier) {
		this._tempRangeMod = mod
	}

	addRangeMod() {
		;(game.user as UserGURPS).addModifier(this._tempRangeMod)
	}

	removeModifier(event: JQuery.ClickEvent) {
		event.preventDefault()
		const modList: RollModifier[] =
			(game.user?.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) as RollModifier[]) ?? []
		const index = $(event.currentTarget).data("index")
		modList.splice(index, 1)
		game.user?.setFlag(SYSTEM_NAME, UserFlags.ModifierStack, modList)
		this.render()
		game.ModifierBucket.render()
	}
}

export { ModifierList }
