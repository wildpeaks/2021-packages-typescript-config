/* eslint-env browser */
import raw = require('./styles.scss');

const container = document.createElement('div');
container.setAttribute('id', 'hello');
if ((typeof raw === 'object') && (raw !== null)){
	container.innerText = `[SCSS IMPORT REQUIRE] Type is ${typeof raw.myclass}`;
} else {
	container.innerText = `[SCSS IMPORT REQUIRE] Unexpected ${JSON.stringify(raw)}`;
}
document.body.appendChild(container);
