/* eslint-env browser */
import * as raw from './styles.css';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
if ((typeof raw === 'object') && (raw !== null)){
	container.innerText = `[CSS IMPORT STAR] Type is ${typeof raw.myclass}`;
} else {
	container.innerText = `[CSS IMPORT STAR] Unexpected ${JSON.stringify(raw)}`;
}
document.body.appendChild(container);
