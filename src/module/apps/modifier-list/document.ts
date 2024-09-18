// import { RollModifierTags, SETTINGS, SYSTEM_NAME, UserFlags } from "@module/data/index.ts"
// import { RollModifier } from "@module/data/roll-modifier.ts"
// import { ActorGURPS2 } from "@module/document/actor.ts"
// import { LastActor } from "@module/util/last-actor.ts"
//
// class ModifierList extends Application {
// 	_tempRangeMod = new RollModifier({ id: "", modifier: 0, tags: [RollModifierTags.Range] })
//
// 	static override get defaultOptions(): ApplicationOptions {
// 		return fu.mergeObject(super.defaultOptions, {
// 			popOut: false,
// 			minimizable: false,
// 			resizable: false,
// 			id: "ModifierList",
// 			template: `systems/${SYSTEM_NAME}/templates/modifier-list/list.hbs`,
// 			classes: ["modifier-list"],
// 		})
// 	}
//
// 	get collapse(): boolean {
// 		const collapse = game.settings.get(SYSTEM_NAME, SETTINGS.MODIFIER_LIST_COLLAPSE)
// 		const button_open = game.gurps.modifierBucket.window.rendered
// 		if (collapse && !button_open) return true
// 		return false
// 	}
//
// 	private get _bottom(): string {
// 		const bottom = Math.max($("body").height()! - $("#players").position().top, 64)
// 		return `bottom: ${bottom}px`
// 	}
//
// 	override async getData(options?: Partial<ApplicationOptions> | undefined): Promise<object> {
// 		const currentMods = game.user?.getFlag(SYSTEM_NAME, UserFlags.ModifierStack)
// 		let targetMods: RollModifier[] = []
// 		const actor = (game.user?.isGM ? await LastActor.get() : game.user?.character) as ActorGURPS2
// 		// game.user?.targets.forEach(e => {
// 		// 	targetMods = targetMods.concat(e.actor?.modifiers ?? [])
// 		// })
//
// 		// const actorMods = actor?.modifiers
//
// 		return fu.mergeObject(super.getData(options), {
// 			currentMods,
// 			targetMods,
// 			// actorMods,
// 			collapse: this.collapse,
// 			bottom: this._bottom,
// 		})
// 	}
//
// 	override activateListeners(html: JQuery<HTMLElement>): void {
// 		super.activateListeners(html)
// 		html.find(".active").on("click", event => this.removeModifier(event))
// 		html.find(".modifier").on("click", event => this._onClickModifier(event))
// 		html.find(".collapse-toggle").on("click", event => this._onCollapseToggle(event))
// 	}
//
// 	override _injectHTML(html: JQuery<HTMLElement>): void {
// 		if ($("body").find("#modifier-list").length === 0) {
// 			html.insertBefore($("body").find("#players"))
// 			this._element = html
// 		}
// 	}
//
// 	_onClickModifier(event: JQuery.ClickEvent): void {
// 		event.preventDefault()
// 		const modifier = new RollModifier({
// 			id: $(event.currentTarget).data("name"),
// 			modifier: $(event.currentTarget).data("modifier"),
// 		})
// 		return game.user.addModifier(modifier)
// 	}
//
// 	_onCollapseToggle(event: JQuery.ClickEvent): this | Promise<this> {
// 		event.preventDefault()
// 		game.settings.set(SYSTEM_NAME, SETTINGS.MODIFIER_LIST_COLLAPSE, !this.collapse)
// 		return this.render(true)
// 	}
//
// 	setRangeMod(mod: RollModifier): void {
// 		this._tempRangeMod = mod
// 	}
//
// 	addRangeMod(): void {
// 		return game.user.addModifier(this._tempRangeMod)
// 	}
//
// 	removeModifier(event: JQuery.ClickEvent): void {
// 		event.preventDefault()
// 		const modList: RollModifier[] =
// 			(game.user?.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) as RollModifier[]) ?? []
// 		const index = $(event.currentTarget).data("index")
// 		modList.splice(index, 1)
// 		game.user?.setFlag(SYSTEM_NAME, UserFlags.ModifierStack, modList)
// 		this.render()
// 		game.gurps.modifierBucket.render()
// 	}
// }
//
// export { ModifierList }
