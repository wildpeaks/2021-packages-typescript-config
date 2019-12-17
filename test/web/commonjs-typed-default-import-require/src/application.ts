import mymodule = require("./mymodule");

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = "[COMMONJS TYPED DEFAULT, IMPORT REQUIRE] Type is " + typeof mymodule;
document.body.appendChild(container);
