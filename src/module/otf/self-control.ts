// import { ParsedOtF, OtFNumberedAction, OptionalCheckParameters } from "./base.ts"
// import { gspan } from "./utils.ts"
//
// // Self control roll CR: N
// /**
//  *
//  * @param str
//  * @param opts
//  */
// export function checkForSelfControl(str: string, opts: OptionalCheckParameters): ParsedOtF | undefined {
// 	const two = str.substring(0, 2)
// 	if (two === "CR" && str.length > 2 && str[2] === ":") {
// 		const rest = str.substring(3).trim()
// 		const num = rest.replace(/([0-9]+).*/g, "$1")
// 		const desc = rest.replace(/[0-9]+ *(.*)/g, "$1")
// 		const action = <OtFNumberedAction>{
// 			orig: str,
// 			type: "controlroll",
// 			num: parseInt(num),
// 			desc: desc,
// 			blindroll: opts.blindroll,
// 			sourceId: opts.sourceId,
// 		}
// 		return <ParsedOtF>{
// 			text: gspan(opts.overridetxt, str, action, opts.blindrollPrefix),
// 			action: action,
// 		}
// 	}
// 	return
// }
