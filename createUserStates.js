/**
 * Create states under 0_userdata.0 or javascript.x
 * Current Version:     https://github.com/Mic-M/iobroker.createUserStates
 * Support:             https://forum.iobroker.net/topic/26839/
 * Autor:               Mic (ioBroker) | Mic-M (github)
 * Version:             1.0 (17 January 2020)
 * Example:
 * -----------------------------------------------
    let statesToCreate = [
        ['Test.Test1', {'name':'Test 1', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'Hello' }],
        ['Test.Test2', {'name':'Test 2', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'Hello' }],
    ];
    createUserStates('0_userdata.0', false, statesToCreate);
 * -----------------------------------------------
 * PLEASE NOTE: Per https://github.com/ioBroker/ioBroker.javascript/issues/474, the used function setObject() 
 *              executes the callback PRIOR to completing the state creation. Therefore, we use a setTimeout and counter. 
 * -----------------------------------------------
 * @param {string} where          Where to create the state: e.g. '0_userdata.0' or 'javascript.x'.
 * @param {boolean} force         Force state creation (overwrite), if state is existing.
 * @param {array} statesToCreate  State(s) to create. single array or array of arrays
 * @param {object} [callback]     Optional: a callback function -- This provided function will be executed after all states are created.
 */
function createUserStates(where, force, statesToCreate, callback = undefined) {
 
    const WARN = false; // Throws warning in log, if state is already existing and force=false. Default is false, so no warning in log, if state exists.
    const LOG_DEBUG = false; // To debug this function, set to true
    // Per issue #474 (https://github.com/ioBroker/ioBroker.javascript/issues/474), the used function setObject() executes the callback 
    // before the state is actual created. Therefore, we use a setTimeout and counter as a workaround.
    // Increase this to 100, if it is not working.
    const DELAY = 50; // Delay in milliseconds (ms)


    // Validate "where"
    if (where.endsWith('.')) where = where.slice(0, -1); // Remove trailing dot
    if ( (where.match(/^javascript.([0-9]|[1-9][0-9])$/) == null) && (where.match(/^0_userdata.0$/) == null) ) {
        log('This script does not support to create states under [' + where + ']', 'error');
        return;
    }

    // Prepare "statesToCreate" since we also allow a single state to create
    if(!Array.isArray(statesToCreate[0])) statesToCreate = [statesToCreate]; // wrap into array, if just one array and not inside an array

    let numStates = statesToCreate.length;
    let counter = -1;
    statesToCreate.forEach(function(param) {
        counter += 1;
        if (LOG_DEBUG) log ('[Debug] Currently processing following state: [' + param[0] + ']');

        // Clean
        let stateId = param[0];
        if (! stateId.startsWith(where)) stateId = where + '.' + stateId; // add where to beginning of string
        stateId = stateId.replace(/\.*\./g, '.'); // replace all multiple dots like '..', '...' with a single '.'
        const FULL_STATE_ID = stateId;

        if( ($(FULL_STATE_ID).length > 0) && (existsState(FULL_STATE_ID)) ) { // Workaround due to https://github.com/ioBroker/ioBroker.javascript/issues/478
            // State is existing.
            if (WARN && !force) log('State [' + FULL_STATE_ID + '] is already existing and will no longer be created.', 'warn');
            if (!WARN && LOG_DEBUG) log('[Debug] State [' + FULL_STATE_ID + '] is already existing. Option force (=overwrite) is set to [' + force + '].');

            if(!force) {
                // State exists and shall not be overwritten since force=false
                // So, we do not proceed.
                numStates--;
                if (numStates === 0) {
                    if (LOG_DEBUG) log('[Debug] All states successfully processed!');
                    if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                        if (LOG_DEBUG) log('[Debug] An optional callback function was provided, which we are going to execute now.');
                        return callback();
                    }
                } else {
                    // We need to go out and continue with next element in loop.
                    return; // https://stackoverflow.com/questions/18452920/continue-in-cursor-foreach
                }
            } // if(!force)
        }

        /************
         * State is not existing or force = true, so we are continuing to create the state through setObject().
         ************/
        let obj = {};
        obj.type = 'state';
        obj.native = {};
        obj.common = param[1];
        setObject(FULL_STATE_ID, obj, function (err) {
            if (err) {
                log('Cannot write object for state [' + FULL_STATE_ID + ']: ' + err);
            } else {
                if (LOG_DEBUG) log('[Debug] Now we are creating new state [' + FULL_STATE_ID + ']')
                let init = null;
                if(param[1].def === undefined) {
                    if(param[1].type === 'number') init = 0;
                    if(param[1].type === 'boolean') init = false;
                    if(param[1].type === 'string') init = '';
                } else {
                    init = param[1].def;
                }
                setTimeout(function() {
                    setState(FULL_STATE_ID, init, true, function() {
                        if (LOG_DEBUG) log('[Debug] setState durchgeführt: ' + FULL_STATE_ID);
                        numStates--;
                        if (numStates === 0) {
                            if (LOG_DEBUG) log('[Debug] All states processed.');
                            if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                                if (LOG_DEBUG) log('[Debug] Function to callback parameter was provided');
                                return callback();
                            }
                        }
                    });
                }, DELAY + (20 * counter) );
            }
        });
    });
}