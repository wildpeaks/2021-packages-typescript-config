const container = document.createElement("div");
container.setAttribute("id", "hello");
document.body.appendChild(container);

class BaseClass {
	public myproperty: string = "BASE";
}
class ChildClass extends BaseClass {
	public myproperty: string = "CHILD";
}

const myobj = new ChildClass();
const before = String(myobj.myproperty);
myobj.myproperty = "MODIFIED";
const after = String(myobj.myproperty);
container.innerText = `[CLASS 2 VARIANT 3 DEFINE FALSE] ${before} ${after}`;

export {};
