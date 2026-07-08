/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


import {Constants} from "./constants.js";

export async function getRandom(accessToken) {
  let response;

  try {
    response = fetch(Constants.Unsplash.API_URL, {
      headers: {
        "Authorization": `Client-ID ${accessToken}`
      }
    });
  } catch (error) {
    return error;
  }

  return response;
}
