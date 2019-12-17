import {myfunction} from "fake1";
const myfunction2 = require("fake2");


const value1 = myfunction();
const value2 = myfunction2();
const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = `[NPM TS INDEX JS INDEX DEFAULT] Value is ${value1} ${value2}`;
document.body.appendChild(container);

export {};
