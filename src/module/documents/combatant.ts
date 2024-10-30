// import { type CombatGURPS } from "./combat.ts"
// import { type TokenDocumentGURPS } from "./token.ts"

import { type TokenDocumentGURPS } from "./token.ts"

class CombatantGURPS<
	TCombat extends Combat | null = Combat | null,
	TTokenDocument extends TokenDocumentGURPS<Scene> | null = TokenDocumentGURPS<Scene> | null,
> extends Combatant<TCombat, TTokenDocument> {}

// interface CombatantGURPS<TCombat extends Combat | null, TTokenDocument extends TokenDocumentGURPS<Scene> | null>
// 	extends Combatant<TCombat, TTokenDocument> {
// 	get actor(): NonNullable<TTokenDocument>["actor"]
// }

export { CombatantGURPS }
