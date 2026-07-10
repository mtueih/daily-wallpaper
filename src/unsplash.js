/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


import {Constants} from "./constants.js";


export function generateRequestParamString(paramInfo) {
	return [
		/* 单值参数。 */
		paramInfo.unsplash.query.length > 0 && `query=${paramInfo.unsplash.query}`,
		paramInfo.unsplash.username.length > 0 && `username=${paramInfo.unsplash.username}`,
		/* 多值参数。 */
		paramInfo.unsplash.topics.length > 0 && `topics=${paramInfo.unsplash.topics.join(",")}`,
		paramInfo.unsplash.collections.length > 0 && `collections=${paramInfo.unsplash.collections.join(",")}`,
		/* 选项参数。 */
		`orientation=${paramInfo.unsplash.orientation}`,
		`content_filter=${paramInfo.unsplash.content_filter}`,
	].filter(Boolean).join("&");
}

export function generateCompleteImageUrl(imageInfo, paramInfo) {
	const ImgixPresets = Constants.Unsplash.IMGIX_PRESETS;

	const urlParam = new Map();
	urlParam.set("ixid", imageInfo.ixid);
	urlParam.set("ixlib", imageInfo.ixlib);

	if (Object.hasOwn(ImgixPresets, paramInfo.unsplash.size)) {
		for (const [k, v] of ImgixPresets[paramInfo.unsplash.size]) {
			urlParam.set(k, v);
		}
	}

	const mergedParams = new URLSearchParams([...paramInfo.other, ...urlParam]);
	return `${Constants.Unsplash.IMAGE_URL_PREFIX}${imageInfo.id}?${mergedParams.toString()}`;
}

export async function getImageInfoByRequest(requestParamString, accessToken) {
	/* 向 Unsplash API 发起请求。 */
	let response;
	try {
		response = await fetch(`${Constants.Unsplash.API_URL}?${requestParamString}`, {
			headers: {
				"Authorization": `Client-ID ${accessToken}`,
			},
		});
	} catch {
		return null;
	}

	if (response.status !== 200) {
		return null;
	}

	let responseJson;

	try {
		responseJson = await response.json();
	} catch {
		return null;
	}

	const rawUrl = responseJson?.urls?.raw;

	if (!rawUrl) {
		return null;
	}

	const match = Constants.Unsplash.IMAGE_URL_PATTERN.exec(rawUrl);

	if (!match) {
		return null;
	}

	return {
		id: match[1],
		ixid: match[2],
		ixlib: match[3],
	};
}
