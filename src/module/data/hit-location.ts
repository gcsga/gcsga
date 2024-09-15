import fields = foundry.data.fields
import { ActorType, gid } from "@data"
import { equalFold } from "@module/util/string-criteria.ts"
import { StringBuilder, TooltipGURPS } from "@util"
import { DiceGURPS } from "./dice.ts"
import { ActorInst } from "./actor/helpers.ts"
import { ActorGURPS2 } from "@module/document/actor.ts"

class HitLocation extends foundry.abstract.DataModel<BodyGURPS, HitLocationSchema> {
	declare rollRange: string
	declare sub_table: BodyGURPS | null

	static override defineSchema(): HitLocationSchema {
		const fields = foundry.data.fields

		return {
			id: new fields.StringField({ initial: game.i18n.localize("gurps.placeholder.hit_location.id") }),
			choice_name: new fields.StringField({
				initial: game.i18n.localize("gurps.placeholder.hit_location.choice_name"),
			}),
			table_name: new fields.StringField({
				initial: game.i18n.localize("gurps.placeholder.hit_location.table_name"),
			}),
			slots: new fields.NumberField({ initial: 0 }),
			hit_penalty: new fields.NumberField({ initial: 0 }),
			dr_bonus: new fields.NumberField({ initial: 0 }),
			description: new fields.StringField({ nullable: true }),
		}
	}

	constructor(
		data: DeepPartial<SourceFromSchema<HitLocationSchema>> & { sub_table?: BodySource | null },
		options?: DataModelConstructionOptions<BodyGURPS>,
	) {
		super(data, options)
		if (data.sub_table) {
			const sub_table = data.sub_table as SourceFromSchema<BodySchema>
			this.sub_table = new BodyGURPS(sub_table, { owningLocation: this })
		}
	}

	get descriptionTooltip(): string {
		return (this.description ?? "").replace(/\n/g, "<br>")
	}

	get owningTable(): BodyGURPS {
		return this.parent
	}

	get actor(): ActorInst<ActorType.Character> {
		return this.owningTable.actor
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
		if (this.sub_table) this.sub_table.updateRollRanges()
		return start + this.slots
	}

	get DR(): Map<string, number> {
		return this._DR()
	}

	_DR(tooltip: TooltipGURPS | null = null, drMap: Map<string, number> = new Map()): Map<string, number> {
		if (this.dr_bonus !== 0) {
			drMap.set(gid.All, this.dr_bonus)
			tooltip?.push(
				game.i18n.format(game.i18n.localize("gurps.tooltip.dr_bonus"), {
					item: this.choice_name,
					bonus: this.dr_bonus.signedString(),
					type: gid.All,
				}),
				"<br>",
			)
		}

		drMap = this.actor.system.addDRBonusesFor(this.id, tooltip, drMap)
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
}

interface HitLocation
	extends foundry.abstract.DataModel<BodyGURPS, HitLocationSchema>,
		Omit<ModelPropsFromSchema<HitLocationSchema>, "sub_table"> {
	sub_table: BodyGURPS | null
}

type HitLocationSchema = {
	id: fields.StringField<string, string, true, false, true>
	choice_name: fields.StringField<string, string, true, false, true>
	table_name: fields.StringField<string, string, true, false, true>
	slots: fields.NumberField<number, number, true, false>
	hit_penalty: fields.NumberField<number, number, true, false, true>
	dr_bonus: fields.NumberField<number, number, true, false>
	description: fields.StringField<string, string, true, true>
}

type HitLocationSource = Omit<SourceFromSchema<HitLocationSchema>, "sub_table"> & {
	sub_table: BodySource | null
}

class BodyGURPS extends foundry.abstract.DataModel<ActorGURPS2 | HitLocation, BodySchema> {
	static override defineSchema(): BodySchema {
		const fields = foundry.data.fields

		return {
			name: new fields.StringField({ required: true, nullable: true, initial: null }),
			roll: new fields.StringField({ required: true, nullable: false, initial: "1d" }),
			locations: new fields.ArrayField(new fields.SchemaField(HitLocation.defineSchema()), { initial: [] }),
		}
	}

	constructor(data: DeepPartial<SourceFromSchema<BodySchema>>, options?: BodyConstructionOptions) {
		super(data, options)

		if (data.locations) {
			this.locations = data.locations.map(e => new HitLocation(e!, { parent: this }))
		}
	}

	get owningLocation(): HitLocation | null {
		if (this.parent instanceof HitLocation) return this.parent
		return null
	}

	get actor(): ActorInst<ActorType.Character> {
		if (this.parent instanceof Actor) return this.parent
		if (this.parent instanceof HitLocation) return this.owningLocation!.actor
		throw new Error("HitLocation does not have a valid actor owner")
	}

	get processedRoll(): DiceGURPS {
		return DiceGURPS.fromString(this.roll)
	}

	updateRollRanges(): void {
		let start = this.processedRoll.minimum(false)
		if (this.locations) for (const location of this.locations) start = location.updateRollRange(start)
	}
}

interface BodyGURPS
	extends foundry.abstract.DataModel<ActorGURPS2 | HitLocation, BodySchema>,
		Omit<ModelPropsFromSchema<BodySchema>, "locations"> {
	locations: HitLocation[]
}

type BodySchema = {
	name: fields.StringField<string, string, true, true, true>
	roll: fields.StringField<string, string, true, false, true>
	locations: fields.ArrayField<fields.SchemaField<HitLocationSchema>>
}

type BodySource = Omit<SourceFromSchema<BodySchema>, "locations"> & {
	locations: HitLocationSource[]
}

interface BodyConstructionOptions extends DataModelConstructionOptions<ActorGURPS2 | HitLocation> {
	owningLocation?: HitLocation | null
}

export { BodyGURPS, HitLocation, type BodySchema, type HitLocationSchema, type BodySource, type HitLocationSource }
