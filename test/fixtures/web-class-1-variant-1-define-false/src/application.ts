/* eslint-env browser */
'use strict';
const container = document.createElement('div');
container.setAttribute('id', 'hello');
document.body.appendChild(container);

class BaseClass1 {
	public myproperty: string;
}
class Class1_Variant1 extends BaseClass1 {
}

const myobj = new Class1_Variant1();
const before = String(myobj.myproperty);
myobj.myproperty = 'MODIFIED';
const after = String(myobj.myproperty);
container.innerText = `[CLASS 1 VARIANT 1 DEFINE FALSE] ${before} ${after}`;

export {};
