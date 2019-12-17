import {h, render} from "preact";

const container = document.createElement("div");
container.setAttribute("id", "hello");
document.body.appendChild(container);

const article = h("article", {className: "example"}, ["[PREACT H] Hello World"]);
render(article, container);
