const {myfunction} = require("./mymodule");

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = "[EXPORT NAMED, REQUIRE] Type is " + typeof myfunction;
document.body.appendChild(container);
