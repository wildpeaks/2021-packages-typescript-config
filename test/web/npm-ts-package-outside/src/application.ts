import {myfunction} from "fake1";

const value = myfunction();
const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = "[NPM TS PACKAGE OUTSIDE] Value is " + value;
document.body.appendChild(container);

export {};
