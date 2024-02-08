import { BodyOwner, LocalizeGURPS, equalFold, sanitizeId } from "@util"
import { BodyObj, HitLocationObj } from "./data.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { gid } from "@data"
import { StringBuilder } from "@util/string_builder.ts"
import { reserved_ids } from "@sytem/attribute/data.ts"

class HitLocation {
	private _id: string
	choiceName: string
	tableName: string
	slots: number
	hitPenalty: number
	drBonus: number
	description?: string
	subTable?: BodyGURPS

	rollRange: string
	owner: BodyOwner
	owningTable?: BodyGURPS

	get id(): string {
		return this._id
	}

	set id(v: string) {
		this._id = sanitizeId(v, false, reserved_ids)
	}

	constructor(actor: BodyOwner) {
		this.owner = actor
		this._id = "id"
		this.choiceName = LocalizeGURPS.translations.gurps.placeholder.hit_location.choice_name
		this.tableName = LocalizeGURPS.translations.gurps.placeholder.hit_location.table_name
		this.slots = 0
		this.hitPenalty = 0
		this.drBonus = 0

		this.rollRange = "-"
	}

	toObject(): HitLocationObj {
		const data: HitLocationObj = {
			id: this.id,
			choice_name: this.choiceName,
			table_name: this.tableName,
			slots: this.slots,
			hit_penalty: this.hitPenalty,
			dr_bonus: this.drBonus,
			description: this.description,
		}
		if (this.subTable) data.sub_table = this.subTable.toObject()
		return data
	}

	static fromObject(data: HitLocationObj, actor: BodyOwner, owningTable?: BodyGURPS): HitLocation {
		const location = new HitLocation(actor)

		location.id = data.id
		location.choiceName = data.choice_name
		location.tableName = data.table_name
		location.slots = data.slots ?? 0
		location.hitPenalty = data.hit_penalty ?? 0
		location.drBonus = data.dr_bonus ?? 0
		location.description = data.description
		if (data.sub_table) location.subTable = BodyGURPS.fromObject(data.sub_table, actor, location)

		if (owningTable) location.owningTable = owningTable
		return location
	}

	updateRollRange(start: number): number {
		switch (this.slots) {
			case 0:
				this.rollRange = "-"
				break
			case 1:
				this.rollRange = `${start}`
				break
			default:
				this.rollRange = `${start}-${start + this.slots - 1}`
		}
		if (this.subTable) this.subTable.updateRollRanges()
		return start + this.slots
	}

	get DR(): Map<string, number> {
		return this._DR()
	}

	_DR(tooltip: TooltipGURPS | null = null, drMap: Map<string, number> = new Map()): Map<string, number> {
		if (this.drBonus !== 0) {
			drMap.set(gid.All, this.drBonus)
			tooltip?.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.tooltip.dr_bonus, {
					item: this.choiceName,
					bonus: this.drBonus.signedString(),
					type: gid.All,
				}),
				"<br>",
			)
		}

		drMap = this.owner.addDRBonusesFor(this.id, tooltip, drMap)
		if (this.owningTable && this.owningTable.owningLocation)
			drMap = this.owningTable.owningLocation._DR(tooltip, drMap)

		if (drMap.size !== 0) {
			const base = drMap.get(gid.All) ?? 0
			const buffer = new StringBuilder()
			for (const k of Array.from(drMap.keys()).sort()) {
				let value = drMap.get(k) ?? 0
				if (!equalFold(gid.All, k)) value += base
				buffer.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.tooltip.dr_total, {
						amount: value,
						type: k,
					}),
					"<br>",
				)
			}
			tooltip?.unshift(buffer.toString())
		}
		return drMap
	}

	get displayDR(): string {
		const drMap = this._DR()
		if (!drMap.has(gid.All)) drMap.set(gid.All, 0)
		const all = drMap.get(gid.All) ?? 0

		const keys: string[] = []
		keys.push(gid.All)
		keys.push(
			...Array.from(drMap.keys())
				.filter(e => e !== gid.All)
				.sort(),
		)
		const buffer = new StringBuilder()
		for (const k of keys) {
			let dr = drMap.get(k) ?? 0
			if (k !== gid.All) dr += all
			if (buffer.length !== 0) buffer.push("/")
			buffer.push(`${dr}`)
		}
		return buffer.toString()
	}
}

class BodyGURPS {
	name?: string
	roll: DiceGURPS
	locations: HitLocation[]

	private _owningLocation?: HitLocation

	get owningLocation(): HitLocation | null {
		return this._owningLocation ?? null
	}

	constructor() {
		this.roll = new DiceGURPS()
		this.locations = []
	}

	toObject(): BodyObj {
		return {
			name: this.name,
			roll: this.roll?.toString(false) ?? "",
			locations: this.locations?.map(e => e.toObject()) ?? [],
		}
	}

	static fromObject(data: BodyObj | undefined, actor: BodyOwner, owningLocation?: HitLocation): BodyGURPS {
		const body = new BodyGURPS()
		body.name = data?.name
		body.roll = new DiceGURPS(data?.roll)
		body.locations = data?.locations?.map(e => HitLocation.fromObject(e, actor)) ?? []

		if (owningLocation) body._owningLocation = owningLocation
		return body
	}

	updateRollRanges(): void {
		let start = this.roll.minimum(false)
		if (this.locations) for (const location of this.locations) start = location.updateRollRange(start)
	}
}

export { HitLocation, BodyGURPS }
