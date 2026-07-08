/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


/**
 * 只支持查询参数，URL 路径不做处理。
 *
 * 支持的查询参数：
 * - collections
 * - topics
 * - username
 * - query 默认 landscape
 * - orientation landscape/portrait/squarish 默认 landscape
 * - content_filter low/high 默认 high
 * - size raw/full/regular/small/thumb 默认 regular
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
export async function requestUrlParser(requestUrl) {
  const CONFIG = {
    SingleValueKeys: new Set(["username", "query"]),
    SingleValueDefault: {
      query: "landscape",
    },

    MultiValueKeys: new Set(["collections", "topics"]),
    MultiValueDefaults: {},

    OptionKeys: new Set(["orientation", "content_filter", "size"]),
    OptionAllowed: {
      orientation: ["landscape", "portrait", "squarish"],
      content_filter: ["low", "high"],
      size: ["raw", "full", "regular", "small", "thumb"],
    },
    OptionDefaultIndex: {
      orientation: 0,
      content_filter: 1,
      size: 2,
    },
  };

  let url;

  try {
    url = new URL(requestUrl);
  } catch {
    return null;
  }

  const params = url.searchParams;

  const result = {
    unsplash: {
      /* 非选项参数采用先默认空值，指定覆盖后，如果都没有覆盖过，再上默认值的策略。 */
      query: "",
      username: "",
      /* 将多值参数初始化为 Set 类型以确保值唯一。 */
      topics: new Set(),
      collections: new Set(),
      /* 选项参数采用先默认值，如果指定则覆盖的策略。 */
      orientation: CONFIG.OptionAllowed.orientation[CONFIG.OptionDefaultIndex.orientation],
      content_filter: CONFIG.OptionAllowed.content_filter[CONFIG.OptionDefaultIndex.content_filter],
      size: CONFIG.OptionAllowed.size[CONFIG.OptionDefaultIndex.size],
    },
    /* 其他参数默认使用 Map，以确保键唯一。 */
    other: new Map(),
  };

  for (const [key, value] of params) {
    /* 忽略为空字符串的键和值。 */
    if (value.trim().length === 0 || key.trim().length === 0) {
      continue;
    }

    /* 单值、选项参数处理。 */
    if (CONFIG.SingleValueKeys.has(key) || CONFIG.OptionKeys.has(key)) {
      result.unsplash[key] = value;
    }
    /* 多值参数处理。 */
    else if (CONFIG.MultiValueKeys.has(key)) {
      result.unsplash[key].add(value);
    }
    /* 其他参数处理。 */
    else {
      result.other.set(key, value);
    }
  }

  /* 处理非选项参数默认值。如果都没有被指定过，才采用默认值。 */
  if (!result.unsplash.query && !result.unsplash.username &&
    result.unsplash.topics.size === 0 && result.unsplash.collections.size === 0
  ) {
    result.unsplash.query = CONFIG.SingleValueDefault.query;
  }

  /* 将多值参数转化成数组，并排序。 */
  result.unsplash.topics = [...result.unsplash.topics];
  result.unsplash.collections = [...result.unsplash.collections];

  result.unsplash.topics.sort();
  result.unsplash.collections.sort();

  return result;
}
