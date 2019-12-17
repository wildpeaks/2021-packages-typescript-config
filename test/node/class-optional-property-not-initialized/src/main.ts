class MyClass {
	public myproperty?: number;
}

const obj = new MyClass();
console.log("[CLASS OPTIONAL PROPERTY NOT INITIALIZED] " + typeof obj.myproperty);
