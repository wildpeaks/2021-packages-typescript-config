const myvariable = {
	hello: "APP1"
};

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = `[ENTRIES EXPORT] Value is ${JSON.stringify(myvariable)}`;
document.body.appendChild(container);

export {};
