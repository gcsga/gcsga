import { NumericCompareType, NumericCriteria } from "./numeric_criteria";

export class WeightCriteria extends NumericCriteria {

	constructor(compare: NumericCompareType, qualifier: number = 0) {
		super(compare, qualifier)
	}
}
