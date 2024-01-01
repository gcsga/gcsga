import { ActorType, gid } from "@module/data"
import { DiceGURPS } from "@module/dice"
import { TooltipGURPS } from "@module/tooltip"
import { LocalizeGURPS } from "@util"
import { CharacterGURPS } from "./document"

class HitLocationTable implements Omit<HitLocationTableData, "roll"> {
	name: string

	roll: DiceGURPS

	actor: CharacterGURPS

	locations: HitLocation[]

	keyPrefix: string

	constructor(
		name: string,
		roll: DiceGURPS | string,
		locations: HitLocationData[],
		actor: CharacterGURPS | any,
		keyPrefix: string
	) {
		this.name = name
		this.roll = roll instanceof DiceGURPS ? roll : new DiceGURPS(roll)
		this.actor = actor
		this.keyPrefix = keyPrefix
		this.locations = locations.map((e, index) => new HitLocation(actor, `${keyPrefix}.locations.${index}`, e))
		this.updateRollRanges()
	}

	get isNested(): boolean {
		return this.locations.some(e => !!e.subTable)
	}

	updateRollRanges(): void {
		let start = this.roll.minimum(false)
		for (const location of this.locations) {
			start = location.updateRollRange(start)
		}
	}

	populateMap(actor: CharacterGURPS, m: Map<string, HitLocation>): void {
		for (const location of this.locations) {
			location.populateMap(actor, m)
		}
	}

	get owningLocation(): HitLocation | undefined {
		const path = this.keyPrefix.replaceAll("sub_table", "subTable").split(".").slice(1, -1)
		if (path.length === 0) return undefined
		let result: any = this.actor.BodyType
		for (let i = 0; i < path.length; i++) {
			result = result[path[i]]
		}
		return result
	}

	toObject(): HitLocationTableData {
		return {
			name: this.name,
			roll: this.roll.string,
			locations: this.locations.map(e => e.toObject()),
		}
	}
}

interface HitLocationTableData {
	name: string
	roll: string
	locations: HitLocationData[]
}

interface HitLocationData {
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
		[key: string]: any
	}
}

class HitLocation implements HitLocationData {
	id!: string

	choice_name!: string

	table_name!: string

	slots!: number

	hit_penalty!: number

	dr_bonus!: number

	description!: string

	sub_table?: HitLocationTableData

	calc?: {
		roll_range: string
		dr: Record<string, number>
		[key: string]: any
	}

	actor: CharacterGURPS

	keyPrefix: string

	roll_range: string
	// owningTable?: HitLocationTable

	constructor(actor: CharacterGURPS | any, keyPrefix: string, data?: HitLocationData) {
		this.actor = actor
		this.keyPrefix = keyPrefix
		this.roll_range = ""
		Object.assign(this, data)
	}

	// gets pixel indent for sheet purposes. Currently hardcoded at 6px per indent
	// TODO: find a way around hardcoding a pixel value
	get indent(): number {
		if (!this.owningTable.owningLocation) return 0
		return this.owningTable.owningLocation.indent + 6
	}

	get subTable(): HitLocationTable | undefined {
		return this.sub_table
			? new HitLocationTable(
					this.sub_table.name,
					this.sub_table.roll,
					this.sub_table.locations,
					this.actor,
					`${this.keyPrefix}.sub_table`
				)
			: undefined
	}

	get owningTable(): HitLocationTable {
		const path = this.keyPrefix.replaceAll("sub_table", "subTable").split(".").slice(1, -2)
		let result: any = this.actor.BodyType
		for (let i = 0; i < path.length; i++) {
			result = result[path[i]]
		}
		return result
	}

	get tooltip(): string {
		const tooltip = new TooltipGURPS()
		this._DR(tooltip)
		return tooltip.toString("<br>", 0)
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

	get DR(): Map<string, number> {
		return this._DR()
	}

	_DR(tooltip?: TooltipGURPS, drMap: Map<string, number> = new Map()): Map<string, number> {
		if (this.dr_bonus && this.dr_bonus !== 0) {
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
		if (this.actor.type === ActorType.Character) drMap = this.actor.addDRBonusesFor(this.id, tooltip, drMap)
		if (this.owningTable.owningLocation) {
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
		// this.calc.dr = Object.fromEntries(drMap)
		return drMap
	}

	populateMap(actor: CharacterGURPS, m: Map<string, HitLocation>): void {
		this.actor = actor
		m.set(this.id, this)
		if (this.sub_table) {
			this.subTable?.populateMap(actor, m)
		}
	}

	updateRollRange(start: number): number {
		if (this.slots === undefined) this.slots = 0
		if (this.slots === 0) this.roll_range = ""
		else if (this.slots === 1) this.roll_range = start.toString()
		else this.roll_range = `${start}-${start + this.slots - 1}`

		if (this.sub_table) this.subTable?.updateRollRanges()
		return start + this.slots
	}

	toObject(): HitLocationData {
		return {
			id: this.id,
			choice_name: this.choice_name,
			table_name: this.table_name,
			slots: this.slots,
			hit_penalty: this.hit_penalty,
			dr_bonus: this.dr_bonus,
			description: this.description,
			sub_table: this.subTable?.toObject(),
			calc: {
				dr: Object.fromEntries(this.DR),
				roll_range: this.roll_range,
				displayDR: this.displayDR,
				tooltip: this.tooltip,
			},
		}
	}
}
export { HitLocation, HitLocationTable, HitLocationData, HitLocationTableData }
