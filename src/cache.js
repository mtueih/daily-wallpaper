/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


import {CONSTANTS} from "./constants.js";
import {
	getNextHourUnix,
	getNextMidnightUnix,
} from "./time.js";


async function generateStringSHA256(str) {
	return [...new Uint8Array(
		await crypto.subtle.digest(
			"SHA-256",
			new TextEncoder().encode(str)
		),
	)].map(b =>
		b.toString(16).padStart(2, "0"),
	).join("");
}

export async function generateCacheKey(requestParamString) {
	const sha256Hash = await generateStringSHA256(requestParamString);

	return `unsplash_image:${sha256Hash}`;
}

export async function getImageInfoFromCache(cacheKV, cacheKey) {
	const cacheValue = await cacheKV.get(cacheKey);
	if (!cacheValue) {
		return null;
	}

	const imageInfoArray = cacheValue.split(";");
	if (imageInfoArray.length !== 3) {
		return null;
	}

	return {
		id: imageInfoArray[0],
		ixid: imageInfoArray[1],
		ixlib: imageInfoArray[2],
	};
}

export async function getLimitFromCache(cacheKV) {
	const limit = await cacheKV.get(Constants.Cache.LIMIT_CACHE_KEY);

	return limit ? Number(limit) : Constants.Unsplash.RATE_LIMIT_PER_HOUR;
}

export async function setLimitToCache(cacheKV, limit) {
	await cacheKV.put(Constants.Cache.LIMIT_CACHE_KEY, limit, {
		/* 绝对过期时间。设为下一个 UTC 整点小时时过期。 */
		expiration: getNextHourUnix(),
	});
}

export async function setImageInfoFromCache(cacheKV, cacheKey, imageInfo, timeZone) {
	await cacheKV.put(cacheKey, [
		imageInfo.id,
		imageInfo.ixid,
		imageInfo.ixlib,
	].join(Constants.Cache.IMAGE_INFO_SEPARATOR), {
		/* 绝对过期时间。设为指定时区下下一天 0:00。 */
		expiration: getNextMidnightUnix(timeZone),
	});
}
