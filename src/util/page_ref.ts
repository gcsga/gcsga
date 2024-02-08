export function pageRef(book: string, ref: string): string {
	const value = basic[ref]
	if (book === "dfrpg" && dfrpg[ref] !== undefined) return dfrpg[ref]
	if (book === "lite" && lite[ref] !== undefined) return lite[ref]
	return value ?? ""
}

const basic: Record<string, string> = {
	armor_divisor: "B378",
	damage_reduction: "P53",
	damage_type: "B379",
	explosions: "B414",
	flexible_armor: "B379",
	hardened_dr: "B47",
	hit_location: "B398",
	injury_tolerance: "B60",
	ranged_half_damage: "B378",
	shotguns_multiple_projectiles: "B409",
	vulnerability: "B161",
}

const dfrpg: Record<string, string> = {
	armor_divisor: "DFX52",
	damage_type: "DFX53",
	explosions: "DFX46",
	hit_location: "DFX53",
	injury_tolerance: "DFX55",
	ranged_half_damage: "DFX43",
	vulnerability: "DFM14",
}

const lite: Record<string, string> = {
	armor_divisor: "L19",
	damage_type: "L19",
	ranged_half_damage: "L19",
}
