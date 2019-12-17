/* eslint-env browser */
import raw from "./styles.css";

const container = document.createElement("div");
container.setAttribute("id", "hello");
if (typeof raw === "object" && raw !== null) {
	container.innerText = `[CSS IMPORT FROM] Type is ${typeof raw.myclass}`;
} else {
	container.innerText = `[CSS IMPORT FROM] Unexpected ${JSON.stringify(raw)}`;
}
document.body.appendChild(container);
