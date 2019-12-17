class MyClass {
	public myproperty?: number = 123;
	constructor(myparam: number) {
		this.myproperty = myparam;
	}
}

const obj = new MyClass(456);
console.log("[CLASS OPTIONAL PROPERTY INITIALIZED CONSTRUCTOR] " + typeof obj.myproperty);
