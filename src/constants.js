/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


export const CONSTANTS = {
	Unsplash: {
		API_URL: "https://api.unsplash.com/photos/random",
		RATE_LIMIT_PER_HOUR: 50,
		IMAGE_URL_PREFIX: "https://images.unsplash.com/photo-",
		IMGIX_PRESETS: {
			thumb: new Map([
				["cs", "tinysrgb"],
				["fit", "max"],
				["fm", "jpg"],
				["q", "80"],
				["w", "200"],
			]),
			small: new Map([
				["cs", "tinysrgb"],
				["fit", "max"],
				["fm", "jpg"],
				["q", "80"],
				["w", "400"],
			]),
			regular: new Map([
				["cs", "tinysrgb"],
				["fit", "max"],
				["fm", "jpg"],
				["q", "80"],
				["w", "1080"],
			]),
			full: new Map([
				["cs", "srgb"],
				["fm", "jpg"],
				["q", "85"],
			]),
		},
		IMAGE_URL_PATTERN: /^https:\/\/images\.unsplash\.com\/photo-(.+)\?ixid=(.+)&ixlib=(.+)$/,
	},
	Cache: {
		IMAGE_INFO_SEPARATOR: ";",
		IMAGE_INFO_NUMBER: 3,
		LIMIT_CACHE_KEY: "unsplash:remaining_requests_this_hour",
	},
	Router: {
		/**
		 * 支持的查询参数：
		 * - collections
		 * - topics
		 * - username
		 * - query 默认 landscape
		 * - orientation landscape/portrait/squarish 默认 landscape
		 * - content_filter low/high 默认 high
		 * - size raw/full/regular/small/thumb 默认 regular
		 */
		PARAM_CONFIG: {
			SingleValueKeys: new Set(["username", "query"]),
			SingleValueDefault: {},

			MultiValueKeys: new Set(["collections", "topics"]),
			MultiValueDefaults: {
				topics: ["nature"],
			},

			OptionKeys: new Set(["orientation", "content_filter", "size"]),
			OptionAllowed: {
				orientation: new Set(["landscape", "portrait", "squarish"]),
				content_filter: new Set(["low", "high"]),
				size: new Set(["raw", "full", "regular", "small", "thumb"]),
			},
			OptionDefault: {
				orientation: "landscape",
				content_filter: "high",
				size: "regular",
			},
		},
	},
};
