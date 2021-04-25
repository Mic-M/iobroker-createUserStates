/**
 * Create states under 0_userdata.0 or javascript.x asynchronously
 * Current Version:     https://github.com/Mic-M/iobroker.createUserStates
 * Support:             https://forum.iobroker.net/topic/26839/
 * Autor:               alexlukas (github)
 * Version:             0.1 (25 April 2021)
 * Example:             see https://github.com/Mic-M/iobroker.createUserStates#beispiel
 * -----------------------------------------------
 * @param {string} where          Where to create the state: '0_userdata.0' or 'javascript.x'.
 * @param {boolean} force         Force state creation (overwrite), if state is existing.
 * @param {array} statesToCreate  State(s) to create. single array or array of arrays
 * @returns {Promise}             Promise combining all createStateAsync-promises
 */
async function createUserStatesAsync(where, force, statesToCreate) {

    const LOG_DEBUG = false; // To debug this function, set to true

    // Validate "where"
    if (where.endsWith('.')) where = where.slice(0, -1); // Remove trailing dot
    if ( (where.match(/^((javascript\.([1-9][0-9]|[0-9]))$|0_userdata\.0$)/) == null) ) {
        log('This script does not support to create states under [' + where + ']', 'error');
        return;
    }

    // Prepare "statesToCreate" since we also allow a single state to create
    if(!Array.isArray(statesToCreate[0])) statesToCreate = [statesToCreate]; // wrap into array, if just one array and not inside an array

    // Add "where" to STATES_TO_CREATE
    for (let i = 0; i < statesToCreate.length; i++) {
        let lpPath = statesToCreate[i][0].replace(/\.*\./g, '.'); // replace all multiple dots like '..', '...' with a single '.'
        lpPath = lpPath.replace(/^((javascript\.([1-9][0-9]|[0-9])\.)|0_userdata\.0\.)/,'') // remove any javascript.x. / 0_userdata.0. from beginning
        lpPath = where + '.' + lpPath; // add where to beginning of string
        statesToCreate[i][0] = lpPath;
    }

    // call createStateAsync for every state that should be created
    const statePromises = statesToCreate.map(s => {
        if (LOG_DEBUG) log('[Debug] calling createStateAsync for [' + s[0] + ']');
        return createStateAsync(s[0], _getInitValue(s), force, s[1]);
    });
    return Promise.all(statePromises);
}

function _getInitValue(state) {
    // mimic same behavior as createState if no init value is provided
    return (state[1]['def'] == undefined) ? null : state[1]['def'];
}