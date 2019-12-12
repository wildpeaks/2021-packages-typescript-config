import {h, render} from "preact";

const container = document.createElement("div");
container.setAttribute("id", "hello");
document.body.appendChild(container);

const article = <article class="example">[PREACT TSX] Hello World</article>;
render(article, container);
