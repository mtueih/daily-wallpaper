/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


/**
 * 只支持查询参数，URL 路径不做处理。
 *
 * 支持 3 种参数：
 * 1. Unsplash 参数；
 * 2. 图像尺寸参数；
 * 3. 其他参数。
 *
 * Unsplash 参数。将会传给 Unsplash API 的参数。
 * 影响同一天内，是否获取到的是同一张图片。
 * 如果 Unsplash 参数情况相同，同一天内获取到的将会是同一张图片。
 *
 * 图片尺寸参数。决定同一张图片，最终会获取到哪个清晰度版本的 URL。
 *
 * 其他参数。将会透穿给最终的图片 URL。
 */
export function requestUrlParser(requestUrlString) {
	/* 构造 URL 对象，并从 URL 对象获取 searchParams 属性。 */
	let params;
	try {
		params = new URL(requestUrlString).searchParams;
	} catch {
		return null;
	}

	/* 常量：参数配置。 */
	const PARAM_CONFIG = {
		/* Unsplash 参数。 */
		UNSPLASH: {
			/**
			 * 单值参数。
			 * - query
			 * - username
			 */
			SINGLE_VALUE_KEYS: new Set(["query", "username"]),
			SINGLE_VALUE_DEFAULTS: {},

			/**
			 * 多值参数。
			 * - topics 默认 wallpapers
			 * - collections
			 */
			MULTI_VALUE_KEYS: new Set(["topics", "collections"]),
			MULTI_VALUE_DEFAULTS: {
				topics: "wallpapers",
			},

			/**
			 * 选项参数。
			 * - orientation landscape/portrait/squarish 默认 landscape
			 * - content_filter low/high 默认 high
			 */
			OPTION_KEYS: new Set(["orientation", "content_filter"]),
			OPTIONS_ALLOWED: {
				orientation: new Set(["landscape", "portrait", "squarish"]),
				content_filter: new Set(["low", "high"]),
			},
			OPTION_DEFAULTS: {
				orientation: "landscape",
				content_filter: "high",
			},
		},
		/* 图像尺寸参数。 */
		IMAGE_SIZE: {
			/**
			 * 选项参数。
			 * - size raw/full/regular/small/thumb 默认 regular
			 */
			OPTION_KEYS: new Set(["size"]),
			OPTIONS_ALLOWED: {
				size: new Set(["raw", "full", "regular", "small", "thumb"]),
			},
			OPTION_DEFAULTS: {
				size: "regular",
			},
		},
	};

	/* 初始化参数信息对象。 */
	const paramInfo = {
		unsplash: new Map(),
		imageSize: new Map(),
		other: new Map(),
	};

	/**
	 * 参数默认值处理。
	 *
	 * 对于 Unsplash 参数中的非选项参数，它们逻辑上是一个整体，
	 * 只要其中任何一个被指定，则它们的默认值就都不会生效。
	 * 因此采取后默认值策略。
	 *
	 * 对于 Unsplash 参数和图像尺寸参数中的非选项参数，它们逻辑上是相互独立的，
	 * 因此采取先默认值策略。
	 */

	/* Unsplash 参数和图像尺寸参数中的非选项参数。 */
	/* Unsplash 参数。 */
	for (const key of PARAM_CONFIG.UNSPLASH.OPTION_KEYS) {
		paramInfo.unsplash.set(key, PARAM_CONFIG.UNSPLASH.OPTION_DEFAULTS[key]);
	}
	/* 图像尺寸参数。 */
	for (const key of PARAM_CONFIG.IMAGE_SIZE.OPTION_KEYS) {
		paramInfo.imageSize.set(key, PARAM_CONFIG.IMAGE_SIZE.OPTION_DEFAULTS[key]);
	}

	/* 遍历 URLSearchParams 对象。  */
	for (const [key, value] of params) {
		const k = key.trim();
		if (!k) continue;

		const v = value.trim();
		if (!v) continue;

		/* Unsplash 参数处理。 */
		/* 单值参数处理。 */
		if (PARAM_CONFIG.UNSPLASH.SINGLE_VALUE_KEYS.has(k)) {
			paramInfo.unsplash.set(k, v);
		}
		/* 多值参数处理。 */
		else if (PARAM_CONFIG.UNSPLASH.MULTI_VALUE_KEYS.has(k)) {
			/* 对多值参数进行去重和排序。 */
			paramInfo.unsplash.set(k,
				[...new Set(v.split(",").filter(Boolean))].sort().join(","),
			);
		}
		/* 选项参数处理。 */
		else if (PARAM_CONFIG.UNSPLASH.OPTION_KEYS.has(k)) {
			if (PARAM_CONFIG.UNSPLASH.OPTIONS_ALLOWED[k].has(v)) {
				paramInfo.unsplash.set(k, v);
			}
		}

			/* 图像尺寸参数处理。 */
		/* 选项参数处理。 */
		else if (PARAM_CONFIG.IMAGE_SIZE.OPTION_KEYS.has(k)) {
			if (PARAM_CONFIG.IMAGE_SIZE.OPTIONS_ALLOWED[k].has(v)) {
				paramInfo.imageSize.set(k, v);
			}
		}

		/* 其他参数处理。 */
		else {
			paramInfo.other.set(k, v);
		}
	}

	/**
	 * 处理 Unsplash 参数非选项参数默认值。
	 * 如果都没有被指定过，才采用默认值。
	 */
	if ([...PARAM_CONFIG.UNSPLASH.SINGLE_VALUE_KEYS, ...PARAM_CONFIG.UNSPLASH.MULTI_VALUE_KEYS]
		.every(key => !paramInfo.unsplash.has(key))
	) {
		/* 单值参数默认值。 */
		for (const key in PARAM_CONFIG.UNSPLASH.SINGLE_VALUE_DEFAULTS) {
			paramInfo.unsplash.set(key, PARAM_CONFIG.UNSPLASH.SINGLE_VALUE_DEFAULTS[key]);
		}

		/* 多值参数默认值。 */
		for (const key in PARAM_CONFIG.UNSPLASH.MULTI_VALUE_DEFAULTS) {
			paramInfo.unsplash.set(key, PARAM_CONFIG.UNSPLASH.MULTI_VALUE_DEFAULTS[key]);
		}
	}

	return paramInfo;
}
