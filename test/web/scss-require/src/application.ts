/* eslint-env browser */
const raw = require("./styles.scss");

const container = document.createElement("div");
container.setAttribute("id", "hello");
if (typeof raw === "object" && raw !== null) {
	container.innerText = `[SCSS REQUIRE] Type is ${typeof raw.myclass}`;
} else {
	container.innerText = `[SCSS REQUIRE] Unexpected ${JSON.stringify(raw)}`;
}
document.body.appendChild(container);
