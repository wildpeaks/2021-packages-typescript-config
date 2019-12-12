import {h, render} from "preact";
import {MyComponentClass} from "./components/MyComponentClass";

const container = document.createElement("div");
container.setAttribute("id", "hello");
document.body.appendChild(container);

const myinstance = h(MyComponentClass, {myprop: "Hello World"});
render(myinstance, container);
