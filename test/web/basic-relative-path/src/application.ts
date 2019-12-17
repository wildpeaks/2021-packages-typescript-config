/* eslint-env web */
import {myfunction} from './modules/mymodule';

const container = document.createElement("div");
container.setAttribute("id", "hello");
container.innerText = "[RELATIVE PATH] " + myfunction();
document.body.appendChild(container);

export {}
