/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


/**
 * 只支持查询参数，URL 路径不做处理。
 *
 * 将据此建立缓存。不同的参数应当分别单独建立缓存。
 * 相同的参数同一天内，应该请求到相同的图片。
 * 因此，相同的参数同一天内，只请求一次 Unsplash API。
 * 如果请求成功，应缓存结果 URL。
 *
 * 选项类型的参数，如果出现不支持的选项，则回退到默认值。
 *
 * collections、topics、username、query 四个参数是一组的。
 * 只要指定了其中任何一个，都会覆盖默认值。
 *
 * 其余参数全部透传给最终的图片 URL。
 */
export function requestUrlParser(requestUrlString) {
	/**
	 * 会被 Workers 处理的查询参数：
	 * - 单值参数：
	 *   - query
	 * 	 - username
	 * - 多值参数：
	 *   - topics 默认 wallpapers
	 *   - collections
	 * - 选项参数：
	 *   - orientation landscape/portrait/squarish 默认 landscape
	 *   - content_filter low/high 默认 high
	 *   - size raw/full/regular/small/thumb 默认 regular
	 */
	const PARAM_CONFIG = {
		/* 单值参数。 */
		SINGLE_VALUE_KEYS: ["query", "username"],
		// SINGLE_VALUE_DEFAULTS: {},

		/* 多值参数。 */
		MULTI_VALUE_KEYS: ["topics", "collections"],
		MULTI_VALUE_DEFAULTS: {
			topics: "wallpapers",
		},

		/* 选项参数。 */
		OPTION_KEYS: ["orientation", "content_filter", "size"],
		OPTIONS_ALLOWED: {
			orientation: ["landscape", "portrait", "squarish"],
			content_filter: ["low", "high"],
			size: ["raw", "full", "regular", "small", "thumb"],
		},
		OPTION_DEFAULT_INDEXES: {
			orientation: 0,
			content_filter: 1,
			size: 2,
		},
	};

	/* 构造 URL 对象。 */
	let requestUrl;
	try {
		requestUrl = new URL(requestUrlString);
	} catch {
		return null;
	}

	/* 初始化参数信息对象。 */
	/**
	 * 非选项参数采用初始空值，先采用指定值，
	 * 随后，如果都没有指定过，再采用默认值的策略。
	 */
	const unsplashParamInfo = new Map();
	const otherParamInfo = new Map();

	/* 选项参数采用先默认值，后指定值的策略。 */
	/* 初始化选项参数。 */
	for (const key of PARAM_CONFIG.OPTION_KEYS) {
		unsplashParamInfo.set(key, PARAM_CONFIG.OPTIONS_ALLOWED[key]
			[PARAM_CONFIG.OPTION_DEFAULT_INDEXES[key]],
		);
	}

	/* 从 URL 对象获取 searchParams 属性。 */
	const params = requestUrl.searchParams;

	/* 遍历 URLSearchParams 对象。  */
	for (const [key, value] of params) {
		/* 忽略为空字符串的键和值。 */
		if (value.trim().length === 0 || key.trim().length === 0) {
			continue;
		}

		/* 单值参数处理。 */
		if (PARAM_CONFIG.SINGLE_VALUE_KEYS.includes(key)) {
			unsplashParamInfo.set(key, value);
		}
		/* 多值参数处理。 */
		else if (PARAM_CONFIG.MULTI_VALUE_KEYS.includes(key)) {
			/* 对多值参数进行去重和排序。 */
			unsplashParamInfo.set(key,
				[...new Set(
					value.split(",").filter(Boolean),
				)].sort().join(","),
			);
		}
		/* 选项参数处理。 */
		else if (PARAM_CONFIG.OPTION_KEYS.includes(key)) {
			if (PARAM_CONFIG.OPTIONS_ALLOWED[key].includes(value)) {
				unsplashParamInfo.set(key, value);
			}
		}
		/* 其他参数处理。 */
		else {
			otherParamInfo.set(key, value);
		}
	}

	/* 处理非选项参数默认值。如果都没有被指定过，才采用默认值。 */
	if (PARAM_CONFIG.SINGLE_VALUE_KEYS.every(k => !unsplashParamInfo.has(k)) &&
		PARAM_CONFIG.MULTI_VALUE_KEYS.every(k => !unsplashParamInfo.has(k))
	) {
		/* 单值参数默认值。 */
		// const singleValueDefaultsKeys = Object.keys(PARAM_CONFIG.SINGLE_VALUE_DEFAULTS);
		// for (const k of singleValueDefaultsKeys) {
		// 	unsplashParamInfo.set(k, PARAM_CONFIG.SINGLE_VALUE_DEFAULTS[k]);
		// }

		/* 多值参数默认值。 */
		const multiValueDefaultsKeys = Object.keys(PARAM_CONFIG.MULTI_VALUE_DEFAULTS);
		for (const k of multiValueDefaultsKeys) {
			unsplashParamInfo.set(k, PARAM_CONFIG.MULTI_VALUE_DEFAULTS[k]);
		}
	}

	return {
		unsplash: unsplashParamInfo,
		other: otherParamInfo,
	};
}
