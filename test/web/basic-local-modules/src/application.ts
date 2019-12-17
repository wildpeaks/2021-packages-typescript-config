/* eslint-env web */
import {myfunction} from 'mymodule';

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = "[LOCAL MODULES] " + myfunction();
document.body.appendChild(container);

export {}
