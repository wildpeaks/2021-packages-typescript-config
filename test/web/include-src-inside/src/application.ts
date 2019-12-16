const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = "[INCLUDE SRC INSIDE] Type is " + typeof window;
document.body.appendChild(container);

export {};
