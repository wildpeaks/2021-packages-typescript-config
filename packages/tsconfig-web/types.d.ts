// CSS Modules
declare module '*.css' {
	const _: {
		[key: string]: string;
	};
	export = _;
}
declare module '*.scss' {
	const _: {
		[key: string]: string;
	};
	export = _;
}

// Url Loader
declare module '*.svg' {
	const _: string;
	export = _;
}
declare module '*.jpg' {
	const _: string;
	export = _;
}
declare module '*.png' {
	const _: string;
	export = _;
}
declare module '*.gif' {
	const _: string;
	export = _;
}
