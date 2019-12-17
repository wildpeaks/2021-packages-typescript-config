/* eslint-env browser */
import raw = require("./styles.css");

const container = document.createElement("div");
container.setAttribute("id", "hello");
if (typeof raw === "object" && raw !== null) {
	container.innerText = `[CSS IMPORT REQUIRE] Type is ${typeof raw.myclass}`;
} else {
	container.innerText = `[CSS IMPORT REQUIRE] Unexpected ${JSON.stringify(raw)}`;
}
document.body.appendChild(container);
