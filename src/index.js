/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


import {requestUrlParser} from "./router.js";
import {getRandom} from "./unsplash.js";

export default {
  async fetch(request, env, ctx) {
    const urlParseRet = await requestUrlParser(request.url);

    console.log(urlParseRet);

    // const ret = await getRandom(env.UNSPLASH_API_KEY);

    // console.log(ret);

    // const retJson = await ret.json();

    // console.log(retJson);

    return new Response("Hello, world!");
  },
};
