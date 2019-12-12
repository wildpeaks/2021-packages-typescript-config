const shared = require("./shared");

const myvariable = {
	hello: "APP1"
};

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = `[ENTRIES IMPORT REQUIRE] Value is ${JSON.stringify(myvariable)}`;
document.body.appendChild(container);

console.log("typeof shared", typeof shared);
