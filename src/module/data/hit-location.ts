import fields = foundry.data.fields
import { ActorType, gid } from "@data"
import { equalFold } from "@module/util/string-criteria.ts"
import { StringBuilder, TooltipGURPS } from "@util"
import { DiceGURPS } from "./dice.ts"
import { type ActorGURPS2 } from "@module/document/actor.ts"

type ActorBodySchema = {
	name: fields.StringField<string, string, true, false, true>
	roll: fields.StringField<string, string, true, false, true>
	locations: fields.ArrayField<fields.SchemaField<HitLocationSchema>>
	sub_tables: fields.ArrayField<fields.SchemaField<HitLocationSubTableSchema>>
}

type HitLocationSchema = {
	id: fields.StringField<string, string, true, false, true>
	choice_name: fields.StringField<string, string, true, false, true>
	table_name: fields.StringField<string, string, true, false, true>
	slots: fields.NumberField<number, number, true, false>
	hit_penalty: fields.NumberField<number, number, true, false, true>
	dr_bonus: fields.NumberField<number, number, true, false>
	description: fields.StringField<string, string, true, true>
	owningTableId: fields.StringField<string, string, false, true, true>
	subTableId: fields.StringField<string, string, false, false, true>
}

type HitLocationSubTableSchema = {
	id: fields.StringField<string, string, true, false, true>
	name: fields.StringField<string, string, true, true, true>
	roll: fields.StringField<string, string, true, false, true>
	owningLocationId: fields.StringField<string, string, true, false, false>
}

// This is the root actor body object.
// It contains flat arrays of hit locations and sub-tables as fields,
// And contains accessors for a hierarchical list of hit locations and sub-tables
class ActorBody extends foundry.abstract.DataModel<ActorGURPS2, ActorBodySchema> {
	static override defineSchema(): ActorBodySchema {
		const fields = foundry.data.fields
		return {
			name: new fields.StringField({ required: true, nullable: false, initial: "Humanoid" }),
			roll: new fields.StringField({ required: true, nullable: false, initial: "3d6" }),
			locations: new fields.ArrayField(new fields.SchemaField(HitLocation.defineSchema())),
			sub_tables: new fields.ArrayField(new fields.SchemaField(HitLocationSubTable.defineSchema())),
		}
	}

	get actor(): ActorGURPS2 {
		return this.parent
	}

	// Hierarchical list of hit locatios with included sub tables
	get hitLocations(): HitLocation[] {
		return this.locations.map(e => new HitLocation(e))
	}

	get subTables(): HitLocationSubTable[] {
		return this.sub_tables.map(e => new HitLocationSubTable(e))
	}

	get owningLocation(): null {
		return null
	}
}

interface ActorBody extends ModelPropsFromSchema<ActorBodySchema> {}

class HitLocation extends foundry.abstract.DataModel<ActorBody, HitLocationSchema> {
	declare rollRange: string

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
			owningTableId: new fields.StringField({ required: false, nullable: true, initial: null }),
			subTableId: new fields.StringField({ required: false, nullable: false, initial: undefined }),
			// sub_table: new fields.EmbeddedDataField(BodyGURPS, { required: false, nullable: true, initial: null }),
		}
	}

	get actor(): ActorGURPS2 {
		return this.parent.actor
	}

	get owningTable(): ActorBody | HitLocationSubTable {
		if (this.owningTableId === null) return this.parent
		return this.parent.subTables.find(e => e.id === this.owningTableId)!
	}

	get subTable(): HitLocationSubTable | null {
		if (!this.subTableId) return null
		return this.parent.subTables.find(e => e.id === this.subTableId)!
	}

	get descriptionTooltip(): string {
		return (this.description ?? "").replace(/\n/g, "<br>")
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

		drMap = this.actor.isOfType(ActorType.Character)
			? this.actor.system.addDRBonusesFor(this.id, tooltip, drMap)
			: new Map()
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

interface HitLocation extends ModelPropsFromSchema<HitLocationSchema> {}

class HitLocationSubTable extends foundry.abstract.DataModel<ActorBody, HitLocationSubTableSchema> {
	static override defineSchema(): HitLocationSubTableSchema {
		const fields = foundry.data.fields

		return {
			id: new fields.StringField({
				required: true,
				nullable: false,
				initial: (_: Record<string, unknown>) => {
					return fu.randomID(12)
				},
			}),
			name: new fields.StringField({ required: true, nullable: true, initial: null }),
			roll: new fields.StringField({ required: true, nullable: false, initial: "1d" }),
			owningLocationId: new fields.StringField({ required: true, nullable: false }),
		}
	}

	get actor(): ActorGURPS2 {
		return this.parent.actor
	}

	get owningLocation(): HitLocation {
		return this.parent.hitLocations.find(e => e.subTableId === this.id)!
	}

	get locations(): HitLocation[] {
		return this.parent.hitLocations.filter(e => e.owningTableId === this.id)
	}

	get processedRoll(): DiceGURPS {
		return DiceGURPS.fromString(this.roll)
	}

	updateRollRanges(): void {
		let start = this.processedRoll.minimum(false)
		if (this.locations) for (const location of this.locations) start = location.updateRollRange(start)
	}
}

interface HitLocationSubTable extends ModelPropsFromSchema<HitLocationSubTableSchema> {}

export { ActorBody, HitLocation, HitLocationSubTable }
export type { ActorBodySchema, HitLocationSchema, HitLocationSubTableSchema }
