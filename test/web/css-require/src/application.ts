/* eslint-env browser */
const raw = require("./styles.css");

const container = document.createElement("div");
container.setAttribute("id", "hello");
if (typeof raw === "object" && raw !== null) {
	container.innerText = `[CSS REQUIRE] Type is ${typeof raw.myclass}`;
} else {
	container.innerText = `[CSS REQUIRE] Unexpected ${JSON.stringify(raw)}`;
}
document.body.appendChild(container);
