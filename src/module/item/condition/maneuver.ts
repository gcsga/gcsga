import { ManeuverID } from "@data"
import { ConditionSystemSource } from "./data.ts"

export function getManeuverList(): Record<ManeuverID, Partial<ConditionSystemSource>> {
	const ConditionList: Record<ManeuverID, Partial<ConditionSystemSource>> = {
		[ManeuverID.DoNothing]: { id: ManeuverID.DoNothing, slug: ManeuverID.DoNothing },
		[ManeuverID.Attack]: { id: ManeuverID.Attack, slug: ManeuverID.Attack },
		[ManeuverID.AOA]: { id: ManeuverID.AOA, slug: ManeuverID.AOA },
		[ManeuverID.AOD]: { id: ManeuverID.AOD, slug: ManeuverID.AOD },
		[ManeuverID.Move]: { id: ManeuverID.Move, slug: ManeuverID.Move },
		[ManeuverID.MoveAndAttack]: { id: ManeuverID.MoveAndAttack, slug: ManeuverID.MoveAndAttack },
		[ManeuverID.AOADouble]: { id: ManeuverID.AOADouble, slug: ManeuverID.AOADouble },
		[ManeuverID.AODDouble]: { id: ManeuverID.AODDouble, slug: ManeuverID.AODDouble },
		[ManeuverID.ChangePosture]: { id: ManeuverID.ChangePosture, slug: ManeuverID.ChangePosture },
		[ManeuverID.Feint]: { id: ManeuverID.Feint, slug: ManeuverID.Feint },
		[ManeuverID.AOAFeint]: { id: ManeuverID.AOAFeint, slug: ManeuverID.AOAFeint },
		[ManeuverID.AODDodge]: { id: ManeuverID.AODDodge, slug: ManeuverID.AODDodge },
		[ManeuverID.Ready]: { id: ManeuverID.Ready, slug: ManeuverID.Ready },
		[ManeuverID.Evaluate]: { id: ManeuverID.Evaluate, slug: ManeuverID.Evaluate },
		[ManeuverID.AOADetermined]: { id: ManeuverID.AOADetermined, slug: ManeuverID.AOADetermined },
		[ManeuverID.AODParry]: { id: ManeuverID.AODParry, slug: ManeuverID.AODParry },
		[ManeuverID.Concentrate]: { id: ManeuverID.Concentrate, slug: ManeuverID.Concentrate },
		[ManeuverID.Aiming]: { id: ManeuverID.Aiming, slug: ManeuverID.Aiming },
		[ManeuverID.AOAStrong]: { id: ManeuverID.AOAStrong, slug: ManeuverID.AOAStrong },
		[ManeuverID.AODBlock]: { id: ManeuverID.AODBlock, slug: ManeuverID.AODBlock },
		[ManeuverID.Wait]: { id: ManeuverID.Wait, slug: ManeuverID.Wait },
		[ManeuverID.BLANK_1]: { id: ManeuverID.BLANK_1, slug: ManeuverID.BLANK_1 },
		[ManeuverID.AOASF]: { id: ManeuverID.AOASF, slug: ManeuverID.AOASF },
		[ManeuverID.BLANK_2]: { id: ManeuverID.BLANK_2, slug: ManeuverID.BLANK_2 },
	}

	return ConditionList
}
