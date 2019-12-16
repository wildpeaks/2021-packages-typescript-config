const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = "[INCLUDE CUSTOM DEFAULT] Type is " + typeof window;
document.body.appendChild(container);

export {};
