const mymodule = require("./mymodule");

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = "[EXPORT DEFAULT, REQUIRE] Value is " + JSON.stringify(mymodule);
document.body.appendChild(container);
