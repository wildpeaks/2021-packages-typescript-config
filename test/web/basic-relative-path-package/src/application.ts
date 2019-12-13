/* eslint-env web */
import {myfunction} from './mymodule';

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = "[RELATIVE PATH PACKAGE] " + myfunction();
document.body.appendChild(container);

export {}
