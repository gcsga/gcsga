import { LocalizeGURPS, StringBuilder, TooltipGURPS, equalFold, sanitizeId } from "@util"
import { BodyObj, HitLocationObj } from "./data.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { gid } from "@data"
import { RESERVED_IDS } from "@system"
import { BodyOwner } from "@module/util/index.ts"

const fields = foundry.data.fields

type HitLocationSchema = {
	id: foundry.data.fields.StringField
	choice_name: foundry.data.fields.StringField
	table_name: foundry.data.fields.StringField
	slots?: foundry.data.fields.NumberField
	hit_penalty?: foundry.data.fields.NumberField
	dr_bonus?: foundry.data.fields.NumberField
	description?: foundry.data.fields.StringField
	sub_table?: foundry.data.fields.ObjectField<BodyObj, BodyObj, false>
}

type BodySchema = {
	name?: foundry.data.fields.StringField
	roll: foundry.data.fields.StringField
	locations?: foundry.data.fields.ArrayField<foundry.data.fields.SchemaField<HitLocationSchema>>
}

class HitLocation<TOwner extends BodyOwner = BodyOwner> {
	private _id: string
	choiceName: string
	tableName: string
	slots: number
	hitPenalty: number
	drBonus: number
	description?: string
	subTable?: BodyGURPS<TOwner>

	rollRange: string
	owner: TOwner
	owningTable?: BodyGURPS<TOwner>

	get id(): string {
		return this._id
	}

	set id(v: string) {
		this._id = sanitizeId(v, false, RESERVED_IDS)
	}

	constructor(owner: TOwner) {
		this.owner = owner
		this._id = "id"
		this.choiceName = game.i18n.localize("gurps.placeholder.hit_location.choice_name")
		this.tableName = game.i18n.localize("gurps.placeholder.hit_location.table_name")
		this.slots = 0
		this.hitPenalty = 0
		this.drBonus = 0

		this.rollRange = ""
	}

	static defineSchema(): HitLocationSchema {
		return {
			id: new fields.StringField({ initial: "id" }),
			choice_name: new fields.StringField({ initial: "untitled choice" }),
			table_name: new fields.StringField({ initial: "untitled location" }),
			slots: new fields.NumberField({ initial: 0 }),
			hit_penalty: new fields.NumberField({ initial: 0 }),
			dr_bonus: new fields.NumberField({ initial: 0 }),
			description: new fields.StringField(),
			sub_table: new fields.ObjectField<BodyObj, BodyObj, false>({ required: false }),
		}
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

	get descriptionTooltip(): string {
		return (this.description ?? "").replace(/\n/g, "<br>")
	}

	static fromObject<TOwner extends BodyOwner>(
		data: HitLocationObj,
		actor: TOwner,
		owningTable?: BodyGURPS<TOwner>,
	): HitLocation<TOwner> {
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
				this.rollRange = ""
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
				game.i18n.format(game.i18n.localize("gurps.tooltip.dr_bonus"), {
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
					game.i18n.format(game.i18n.localize("gurps.tooltip.dr_total"), {
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

	// Return true if the provided ID is a valid hit location ID
	static validateId(id: string): boolean {
		return id !== gid.All
	}

	static newObject(): HitLocationObj {
		return {
			id: LocalizeGURPS.translations.gurps.placeholder.hit_location.id,
			choice_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.choice_name,
			table_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.table_name,
		}
	}
}

class BodyGURPS<TOwner extends BodyOwner = BodyOwner> {
	owner?: TOwner
	name?: string
	roll: DiceGURPS
	locations: HitLocation<TOwner>[]

	private _owningLocation?: HitLocation<TOwner>

	get owningLocation(): HitLocation<TOwner> | null {
		return this._owningLocation ?? null
	}

	constructor(owner?: TOwner) {
		this.roll = new DiceGURPS()
		this.locations = []
		if (owner) this.owner = owner
	}

	static defineSchema(): BodySchema {
		return {
			name: new fields.StringField(),
			roll: new fields.StringField({ initial: "3d" }),
			locations: new fields.ArrayField(new fields.SchemaField(HitLocation.defineSchema())),
		}
	}

	toObject(): BodyObj {
		return {
			name: this.name,
			roll: this.roll?.toString(false) ?? "",
			locations: this.locations?.map(e => e.toObject()) ?? [],
		}
	}

	static fromObject<TOwner extends BodyOwner>(
		data: BodyObj | undefined,
		actor: TOwner,
		owningLocation?: HitLocation<TOwner>,
	): BodyGURPS<TOwner> {
		const body = new BodyGURPS(actor)
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

	static newObject(): BodyObj {
		return {
			name: "",
			roll: "1d",
			locations: [],
		}
	}
}

export { HitLocation, BodyGURPS }
