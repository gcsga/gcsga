import { ActorType, gid } from "@module/data"
import { DiceGURPS } from "@module/dice"
import { TooltipGURPS } from "@module/tooltip"
import { LocalizeGURPS } from "@util"
import { CharacterGURPS } from "./document"

export interface HitLocationTable {
	name: string
	roll: DiceGURPS
	locations: HitLocation[]
	owningLocation?: HitLocation
}

export interface HitLocationTableData {
	name: string
	roll: DiceGURPS
	locations: HitLocationData[]
}

export class HitLocation {
	// actor: CharacterGURPS

	private _actor: string
	// private _owningTable: HitLocationTable

	id: string

	choice_name: string

	table_name: string

	slots: number

	hit_penalty: number

	dr_bonus: number

	description: string

	sub_table?: HitLocationTable

	roll_range: string

	calc: any

	// TODO: change "any" to something accepting both CharacterGURPS and other (for testing?)
	constructor(actor: CharacterGURPS, data?: HitLocationData) {
		this.id = "id"
		if (typeof game !== "undefined") {
			this.choice_name = LocalizeGURPS.translations.gurps.placeholder.hit_location.choice_name
			this.table_name = LocalizeGURPS.translations.gurps.placeholder.hit_location.table_name
		} else {
			this.choice_name = "untitled choice"
			this.table_name = "untitled location"
		}
		this.slots = 0
		this.hit_penalty = 0
		this.dr_bonus = 0
		this.description = ""
		this._actor = actor.uuid
		this.roll_range = "-"
		this.calc = { roll_range: "-", dr: {} }

		if (data) {
			Object.assign(this, data)
			if (this.sub_table) {
				for (let i = 0; i < this.sub_table?.locations.length; i++) {
					this.sub_table!.locations[i] = new HitLocation(actor, this.sub_table!.locations[i])
				}
			}
		}
	}

	get actor(): CharacterGURPS {
		return fromUuidSync(this._actor) as CharacterGURPS
	}

	get owningTable(): HitLocationTable | undefined {
		const recurseLocation = function(location: HitLocation): HitLocation[] {
			const children: HitLocation[] = []
			location.sub_table?.locations?.forEach(e => {
				children.push(e)
				children.push(...recurseLocation(e))
			})
			return children
		}
		const hit_locations: HitLocation[] = []
		this.actor.HitLocations.forEach(e => {
			hit_locations.push(e)
			hit_locations.push(...recurseLocation(e))
		})

		if (this.actor.HitLocations.some(e => e.id === this.id)) return this.actor.BodyType
		const owningLocation = hit_locations.find(e => e.sub_table?.locations.some(e => e.id === this.id))
		if (!owningLocation) {
			console.error(`Location ${this.id} somehow has no parent table`)
			return
		}

		return {
			...owningLocation.sub_table!,
			owningLocation
		}
	}

	get tooltip(): string {
		const tooltip = new TooltipGURPS()
		this._DR(tooltip)
		return tooltip.toString("<br>", 0)
	}

	get DR(): Map<string, number> {
		return this._DR()
	}

	_DR(tooltip?: TooltipGURPS, drMap: Map<string, number> = new Map()): Map<string, number> {
		if (this.dr_bonus !== 0) {
			drMap.set(gid.All, this.dr_bonus)
			tooltip?.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.tooltip.dr_bonus, {
					item: this.choice_name,
					bonus: this.dr_bonus.signedString(),
					type: gid.All,
				}),
				"<br>"
			)
		}
		if (this.actor.type === ActorType.Character)
			drMap = this.actor.addDRBonusesFor(this.id, tooltip, drMap)
		if (this.owningTable?.owningLocation) {
			drMap = this.owningTable.owningLocation._DR(tooltip, drMap)
		}
		for (const k of drMap.keys()) {
			if (k === gid.All) continue
			drMap.set(k, drMap.get(k)! + (drMap.get(gid.All) ?? 0))
		}
		if (drMap.size !== 0) tooltip?.unshift("<br><br>")
		for (const k of drMap.keys()) {
			if (k === gid.All) continue
			tooltip?.unshift(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.tooltip.dr_total, {
					amount: String(drMap.get(k)),
					type: k,
				}),
				"<br>"
			)
		}
		if (drMap.has(gid.All))
			tooltip?.unshift(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.tooltip.dr_total, {
					amount: String(drMap.get(gid.All)),
					type: gid.All,
				}),
				"<br>"
			)
		if (drMap.size !== 0) tooltip?.unshift("<br>")
		tooltip?.unshift(
			LocalizeGURPS.format(LocalizeGURPS.translations.gurps.tooltip.dr_name, { name: this.table_name })
		)

		// If (tooltip && drMap?.entries.length !== 0) {
		// 	drMap?.forEach(e => {
		// 		tooltip.push(`TODO: ${e}`)
		// 	})
		// }
		this.calc.dr = Object.fromEntries(drMap)
		return drMap
	}

	get displayDR(): string {
		const dr = this.DR
		if (!dr.has(gid.All)) dr.set(gid.All, 0)
		let buffer = ""
		buffer += dr.get(gid.All)
		dr.forEach((v, id) => {
			if (id === gid.All) return
			buffer += `/${v}`
		})
		return buffer
	}

	updateRollRange(start: number): number {
		// This.calc ??= { roll_range: "", dr: {} }
		this.slots ??= 0
		if (this.slots === 0) this.roll_range = ""
		else if (this.slots === 1) this.roll_range = start.toString()
		else {
			this.roll_range = `${start}-${start + this.slots - 1}`
		}
		if (this.sub_table) {
			let nested_start = new DiceGURPS(this.sub_table.roll).minimum(false)
			for (const l of this.sub_table.locations) {
				nested_start = l.updateRollRange(nested_start)
			}
		}
		this.calc.roll_range = this.roll_range
		return start + this.slots
	}
}

export interface HitLocationData {
	id: string
	choice_name: string
	table_name: string
	slots: number
	hit_penalty: number
	dr_bonus: number
	description: string
	sub_table?: HitLocationTableData
	calc?: {
		roll_range: string
		dr: Record<string, number>
	}
}
