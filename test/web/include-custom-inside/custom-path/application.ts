const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = "[INCLUDE CUSTOM INSIDE] Type is " + typeof window;
document.body.appendChild(container);

export {};
