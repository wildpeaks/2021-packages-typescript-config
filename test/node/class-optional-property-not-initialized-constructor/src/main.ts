class MyClass {
	public myproperty?: number;
	constructor(myparam: number) {
		this.myproperty = myparam;
	}
}

const obj = new MyClass(123);
console.log("[CLASS OPTIONAL PROPERTY NOT INITIALIZED CONSTRUCTOR] " + typeof obj.myproperty);
