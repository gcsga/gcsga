import { ActorInst } from "@module/data/actor/helpers.ts"
import { ActorType, SYSTEM_NAME } from "@module/data/constants.ts"

const { api, sheets } = foundry.applications
class CharacterSheetGURPS extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2<ActorInst<ActorType.Character>>) {
	// Set initial values for tabgroups
	override tabGroups: Record<string, string> = {
		primary: "combat",
	}

	static override DEFAULT_OPTIONS: Partial<DocumentSheetConfiguration> & { dragDrop: DragDropConfiguration[] } = {
		tag: "form",
		classes: ["gurps", "actor", "character"],
		window: {
			contentClasses: [""],
			icon: "gcs-character",
			title: "",
			controls: [],
			resizable: true,
		},
		position: {
			width: 800,
			// height: "auto",
			height: 550,
		},
		form: {
			submitOnChange: true,
			closeOnSubmit: false,
			handler: this.#onSubmit,
		},
		actions: {
			toggleEditable: this.#onToggleEditable,
		},
		dragDrop: [{ dragSelector: "item-list .item", dropSelector: null }],
	}

	static override PARTS = {
		header: {
			id: "header",
			template: `systems/${SYSTEM_NAME}/templates/actors/parts/character-header.hbs`,
		},
		// sidebar: {
		// 	id: "sidebar",
		// 	template: `systems/${SYSTEM_NAME}/templates/actors/parts/character-sidebar.hbs`,
		// },
		combatTab: {
			id: "combat",
			template: `systems/${SYSTEM_NAME}/templates/actors/tabs/character-combat.hbs`,
		},
		traitTab: {
			id: "traits",
			template: `systems/${SYSTEM_NAME}/templates/actors/tabs/character-traits.hbs`,
		},
		skillTab: {
			template: `systems/${SYSTEM_NAME}/templates/actors/tabs/character-skills.hbs`,
			id: "skills",
		},
		spellTab: {
			id: "spells",
			template: `systems/${SYSTEM_NAME}/templates/actors/tabs/character-spells.hbs`,
		},
		equipmentTab: {
			id: "equipment",
			template: `systems/${SYSTEM_NAME}/templates/actors/tabs/character-equipment.hbs`,
		},
		effectTab: {
			id: "effects",
			template: `systems/${SYSTEM_NAME}/templates/actors/tabs/character-effects.hbs`,
		},
		profileTab: {
			id: "profile",
			template: `systems/${SYSTEM_NAME}/templates/actors/tabs/character-profile.hbs`,
		},
	}

	protected _getTabs(): Record<string, Partial<ApplicationTab>> {
		return this._markTabs({
			combatTab: {
				id: "combat",
				group: "primary",
				icon: "fa-solid fa-bolt",
				label: "COMBAT",
			},
			traitTab: {
				id: "traits",
				group: "primary",
				icon: "fa-regular gcs-trait",
				label: "TRAITS",
			},
			skillTab: {
				id: "skills",
				group: "primary",
				icon: "fa-regular gcs-skill",
				label: "SKILLS",
			},
			spellTab: {
				id: "spells",
				group: "primary",
				icon: "fa-regular gcs-spell",
				label: "SPELLS",
			},
			equipmentTab: {
				id: "equipment",
				group: "primary",
				icon: "fa-regular gcs-equipment",
				label: "EQUIPMENT",
			},
			effectTab: {
				id: "effects",
				group: "primary",
				icon: "fa-solid fa-sparkles",
				label: "Effects",
			},
			profileTab: {
				id: "profile",
				group: "primary",
				icon: "fa-solid fa-memo",
				label: "PROFILE",
			},
		})
	}

	protected _markTabs(tabs: Record<string, Partial<ApplicationTab>>): Record<string, Partial<ApplicationTab>> {
		for (const v of Object.values(tabs)) {
			v.active = this.tabGroups[v.group!] === v.id
			v.cssClass = v.active ? "active" : ""
			if ("tabs" in v) this._markTabs(v.tabs as Record<string, Partial<ApplicationTab>>)
		}
		return tabs
	}

	override async _prepareContext(_options = {}): Promise<object> {
		const primaryTabs = Object.fromEntries(
			Object.entries(this._getTabs()).filter(([_, v]) => v.group === "primary"),
		)
		return {
			// editable: this.isEditable,
			tabs: this._getTabs(),
			primaryTabs,
			actor: this.actor,
			system: this.actor.system,
			encumbrance: this.actor.system.encumbrance,
		}
	}

	protected override _onRender(context: object, options: ApplicationRenderOptions): void {
		super._onRender(context, options)
		this.element.classList.add(this.actor.type)
	}

	protected override async _preparePartContext(partId: string, context: Record<string, any>): Promise<object> {
		context.partId = `${this.id}-${partId}`
		context.tab = context.tabs[partId]
		return context
	}

	static async #onSubmit(
		this: CharacterSheetGURPS,
		event: Event | SubmitEvent,
		_form: HTMLFormElement,
		_formData: FormDataExtended,
	): Promise<void> {
		event.preventDefault()
	}

	static async #onToggleEditable(this: CharacterSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()

		// if (!game.user.isGM && this.document.limited) {
		// 	html[0].classList.add("limited")
		// 	return html
		// }
	}
}

interface CharacterSheetGURPS {
	get document(): ActorInst<ActorType.Character>
}

export { CharacterSheetGURPS }
