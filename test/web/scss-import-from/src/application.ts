/* eslint-env browser */
import raw from './styles.scss';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
if ((typeof raw === 'object') && (raw !== null)){
	container.innerText = `[SCSS IMPORT FROM] Type is ${typeof raw.myclass}`;
} else {
	container.innerText = `[SCSS IMPORT FROM] Unexpected ${JSON.stringify(raw)}`;
}
document.body.appendChild(container);
