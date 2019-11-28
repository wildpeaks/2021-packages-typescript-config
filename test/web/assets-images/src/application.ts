/* eslint-env browser */
'use strict';
import {mymodule as mymodule1} from 'mymodule-jpg';
import {mymodule as mymodule2} from 'mymodule-png';
import {mymodule as mymodule3} from 'mymodule-svg';

const container = document.createElement('div');
container.setAttribute('id', 'hello');
mymodule1(container);
mymodule2(container);
mymodule3(container);
document.body.appendChild(container);
