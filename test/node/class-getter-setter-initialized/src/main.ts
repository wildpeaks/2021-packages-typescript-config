class MyClass {
	private _myproperty: number = 123;
	public get myproperty(): number {
		return this._myproperty;
	}
	public set myproperty(newValue: number) {
		this._myproperty = newValue;
	}
}

const obj = new MyClass();
console.log("[CLASS GETTER SETTER INITIALIZED] " + typeof obj.myproperty);
