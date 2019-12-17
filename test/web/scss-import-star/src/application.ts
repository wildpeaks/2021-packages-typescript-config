/* eslint-env browser */
import * as raw from "./styles.scss";

const container = document.createElement("div");
container.setAttribute("id", "hello");
if (typeof raw === "object" && raw !== null) {
	container.innerText = `[SCSS IMPORT STAR] Type is ${typeof raw.myclass}`;
} else {
	container.innerText = `[SCSS IMPORT STAR] Unexpected ${JSON.stringify(raw)}`;
}
document.body.appendChild(container);
