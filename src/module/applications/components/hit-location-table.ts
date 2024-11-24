import { ErrorGURPS, htmlClosest } from "@util"
import sheets = foundry.applications.sheets
import { ActorGURPS2 } from "@module/documents/actor.ts"
import { HitLocation } from "@module/data/hit-location.ts"
import { ActorType } from "@module/data/constants.ts"

class HitLocationTableElement extends HTMLElement {
	/* -------------------------------------------- */
	/*  Element Lifecycle                           */
	/* -------------------------------------------- */

	connectedCallback(): void {
		const app = foundry.applications.instances.get(htmlClosest(this, ".application")?.id ?? "")
		if (app instanceof sheets.ActorSheetV2) this.#app = app
		else {
			throw ErrorGURPS("Application holding Inventory element is not an Actor Sheet or Item Sheet")
		}
		this.replaceChildren()
		this.append(...this._buildElements())
	}

	/* -------------------------------------------- */

	_buildElements(): HTMLElement[] {
		if (this.actor?.isOfType(ActorType.Character)) {
			const headerEl = document.createElement("tr")

			const rollEl = document.createElement("th")
			rollEl.innerText = "Roll"
			headerEl.append(rollEl)

			const locationEl = document.createElement("th")
			locationEl.innerText = "Location"
			headerEl.append(locationEl)

			const drEl = document.createElement("th")
			drEl.innerText = "DR"
			headerEl.append(drEl)

			const notesEl = document.createElement("th")
			notesEl.innerText = "Notes"
			headerEl.append(notesEl)

			const arr: HTMLElement[] = [headerEl]

			const getLocationElements = (location: HitLocation): HTMLElement[] => {
				const el = document.createElement("tr")
				el.dataset.id = location.id
				el.dataset.depth = String(location.depth)

				const rollEl = document.createElement("td")
				rollEl.innerText = location.rollRange
				el.append(rollEl)

				const locationEl = document.createElement("td")
				locationEl.classList.add("location")
				locationEl.innerText = location.table_name
				const penaltyEl = document.createElement("a")
				penaltyEl.innerText = String(location.hit_penalty)
				locationEl.append(penaltyEl)
				el.append(locationEl)

				const drEl = document.createElement("td")
				drEl.innerText = location.displayDR
				el.append(drEl)

				const notesEl = document.createElement("td")
				notesEl.innerText = ""
				el.append(notesEl)

				if (location.subTable !== null) {
					const arr: HTMLElement[] = [el]
					location.subTable?.hitLocations.forEach(e => arr.push(...getLocationElements(e)))
				}

				return [el]
			}

			this.actor.system.body.hitLocations.forEach(e => arr.push(...getLocationElements(e)))
			return arr
		}
		return []
	}

	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/**
	 * Reference to the application that contains this component.
	 */
	#app!: sheets.ActorSheetV2<ActorGURPS2>

	/* -------------------------------------------- */

	/**
	 * Reference to the application that contains this component.
	 */
	protected get _app(): sheets.ActorSheetV2<ActorGURPS2> {
		return this.#app
	}

	/* -------------------------------------------- */

	/**
	 * Containing actor for this inventory, either the document or its parent if document is an item.
	 */
	get actor(): ActorGURPS2 | null {
		return this.document
	}

	/* -------------------------------------------- */

	/**
	 * Document whose inventory is represented.
	 */
	get document(): ActorGURPS2 {
		return this._app.document
	}

	/* -------------------------------------------- */
	/*  Helpers                                     */
	/* -------------------------------------------- */

	getLocation(id: string): HitLocation | null {
		if (this.actor?.isOfType(ActorType.Character)) {
			return this.actor.system.body.locations.find(e => e.id === id) ?? null
		}
		return null
	}

	/* -------------------------------------------- */
	/*  Event Handlers                              */
	/* -------------------------------------------- */

	protected _onClickRollButton(_element: HTMLElement): void {
		// TODO: implement rolling random location.
		// notes: if location has sub-table, roll again.
	}

	protected _onClickPenalty(element: HTMLElement): void {
		const location = this.getLocation(element.dataset.id ?? "")
		if (location === null) throw ErrorGURPS(`Location with id "${element.dataset.id}" does not exist.`)

		// TODO: implement adding to modifier bucket
	}
}

export { HitLocationTableElement }
