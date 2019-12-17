import {myfunction} from "fake1";
const myfunction2 = require("fake2");

const value1 = myfunction();
const value2 = myfunction2();
console.log(`[NPM TS INDEX OUTSIDE JS INDEX INSIDE] Value is ${value1} ${value2}`);

export {};
