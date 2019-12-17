class MyClass {
	public myproperty?: number = 123;
	constructor (myparam: number) {
		this.myproperty = myparam;
	}
}

const obj = new MyClass(456);
console.log("[CLASS CONSTRUCTOR PROPERTY INITIALIZED] " + typeof obj.myproperty);
