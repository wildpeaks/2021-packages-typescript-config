class MyClass {
	private _myproperty: number;
	public get myproperty(): number {
		return this._myproperty;
	}
	public set myproperty(newValue: number) {
		this._myproperty = newValue;
	}
	public constructor(myparam: number) {
		this._myproperty = myparam;
	}
}

const obj = new MyClass(123);
console.log("[CLASS GETTER SETTER CONSTRUCTOR] " + typeof obj.myproperty);
