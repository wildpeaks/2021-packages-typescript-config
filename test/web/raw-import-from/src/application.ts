/* eslint-env browser */
import raw from "./example.md";

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = "[RAW IMPORT FROM] " + JSON.stringify(raw);
document.body.appendChild(container);
