class MyClass<T> {
	public myproperty: T;
}

const obj = new MyClass<number>();
console.log("[CLASS GENERIC PROPERTY NOT INITIALIZED] " + typeof obj.myproperty);
