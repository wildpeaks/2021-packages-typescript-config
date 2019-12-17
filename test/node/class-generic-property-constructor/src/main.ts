class MyClass<T> {
	public myproperty: T;
	public constructor(myparam: T) {
		this.myproperty = myparam;
	}
}

const obj = new MyClass(456);
console.log("[CLASS GENERIC PROPERTY CONSTRUCTOR] " + typeof obj.myproperty);
