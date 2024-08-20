class SystemDataModel {
	static mixin<T extends (typeof SystemDataModel)[]>(...templates: T): CombinedClass<T> {
		// Implementation of the mixin logic
		// This is a placeholder to illustrate the type
		return class extends SystemDataModel {} as any
	}
}

// Type to get the instance type of a class constructor
type InstanceTypeOf<T> = T extends new (...args: any[]) => infer R ? R : never

// Type to combine instance types of all classes in the array
type CombinedInstanceType<T extends any[]> = T extends [infer U, ...infer Rest]
	? U extends new (...args: any[]) => any
		? InstanceTypeOf<U> & CombinedInstanceType<Rest>
		: never
	: {}

// Type to combine static types of all classes in the array
type CombinedStaticType<T extends any[]> = T extends [infer U, ...infer Rest] ? U & CombinedStaticType<Rest> : {}

// Type to represent the combined class with both static and instance members
type CombinedClass<T extends any[]> = CombinedStaticType<T> & (new (...args: any[]) => CombinedInstanceType<T>)

class A extends SystemDataModel {
	static staticA = "A"
	propA = 1
}

class B extends SystemDataModel {
	static staticB = "B"
	propB = 2
}

const MixedClass = SystemDataModel.mixin(A, B)

const instance = new MixedClass()
console.log(instance.propA) // 1
console.log(instance.propB) // 2

console.log(MixedClass.staticA) // 'A'
console.log(MixedClass.staticB) // 'B'
