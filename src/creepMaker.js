var Constants = require('const');

function createNextCreep(memoryObj, spawn, state, offenceCreeps, defenceCreeps, harvesterCreeps, extensionCount){
	switch(state){
	    case Constants.STATE_AMASS:
	        if(offenceCreeps%2 == 0){
				makeOffenceRangeCreep(memoryObj, spawn);
			}
			else{
				makeOffenceShortCreep(memoryObj, spawn);
			}
	        break;
	    case Constants.STATE_CHECK:
	        //NO MANUFACTURE UNTIL CHECKED
	        break;
		case Constants.STATE_DEFENCE:
			if(harvesterCreeps == 0 || harvesterCreeps < defenceCreeps){
				makeHarvesterCreep(memoryObj, spawn, extensionCount);
			}
			else{
				if(defenceCreeps%2 == 0){
					makeDefenceRangeCreep(memoryObj, spawn, extensionCount);
				}
				else{
					makeDefenceShortCreep(memoryObj, spawn, extensionCount);
				}
			}
			break;
		case Constants.STATE_EXPAND:
			if(memoryObj.room.controller){
				makeWorkerCreep(memoryObj, spawn, extensionCount);
			}
			break;
		case Constants.STATE_STORE:
			if(memoryObj.room.controller){
				makeWorkerCreep(memoryObj, spawn, extensionCount);
			}
			break;
	    case Constants.STATE_SPREAD:
	    	if(memoryObj.room.controller){
				makeWorkerCreep(memoryObj, spawn, extensionCount);
			}
	        //makeOffenceCreep();
	        break;
	}
}

function makeDefenceShortCreep(memoryObj, spawn, extensionCount){
	var array = [MOVE, MOVE, ATTACK];
	if(extensionCount > 15){
		array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK];
	}
	if(extensionCount > 9){
		array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK];
	}
	if(extensionCount > 4){
		array = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK];
	}

	var creep = spawn.createCreep(array, undefined, {job:Constants.CREEP_DEFENCE});
	if(typeof(creep) === "string"){
		memoryObj.memory.screeps.push(creep);
	}
}
function makeDefenceRangeCreep(memoryObj, spawn, extensionCount){
	var array = [MOVE, MOVE, RANGED_ATTACK];
	if(extensionCount > 15){
		array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
	}
	if(extensionCount > 9){
		array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK];
	}
	if(extensionCount > 4){
		array = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK];
	}
	var creep = spawn.createCreep(array, undefined, {job:Constants.CREEP_DEFENCE});
	if(typeof(creep) === "string"){
		memoryObj.memory.screeps.push(creep);
	}
}
function makeOffenceShortCreep(memoryObj, spawn, extensionCount){
	var creep = spawn.createCreep([TOUGH, TOUGH, MOVE, ATTACK], undefined, {job:Constants.CREEP_OFFENCE});
	if(typeof(creep) === "string"){
		memoryObj.memory.screeps.push(creep);
	}
}
function makeOffenceRangeCreep(memoryObj, spawn, extensionCount){
	var creep = spawn.createCreep([TOUGH, TOUGH, MOVE, RANGED_ATTACK], undefined, {job:Constants.CREEP_OFFENCE});
	if(typeof(creep) === "string"){
		memoryObj.memory.screeps.push(creep);
	}
}
function makeHarvesterCreep(memoryObj, spawn, extensionCount){
	var array = [WORK, CARRY, MOVE, MOVE];
	if(extensionCount > 15){
		array = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
	}
	if(extensionCount > 9){
		array = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
	}
	if(extensionCount > 4){
		array = [WORK, WORK, CARRY, MOVE, MOVE];
	}
	var creep = spawn.createCreep(array, undefined, {job:Constants.CREEP_HARVESTER});
	if(typeof(creep) === "string"){
		memoryObj.memory.screeps.push(creep);
	}
}
function makeWorkerCreep(memoryObj, spawn, extensionCount){
	var array = [WORK, CARRY, CARRY, MOVE, MOVE];
	if(extensionCount > 15){
		array = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
	}
	if(extensionCount > 9){
		array = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
	}
	if(extensionCount > 4){
		array = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
	}
	var creep = spawn.createCreep(array, undefined, {job:Constants.CREEP_WORKER});
	if(typeof(creep) === "string"){
		memoryObj.memory.screeps.push(creep);
	}
}

function screepIsDead(memoryObj, name, obj){
    if(obj === undefined){
        if(memoryObj.memory.hasSpawned.indexOf(name) >= 0){
            //Has been spawned, so kill this object
            memoryObj.memory.hasSpawned.splice(memoryObj.memory.hasSpawned.indexOf(name), 1);
            memoryObj.memory.screeps.splice(memoryObj.memory.screeps.indexOf(name), 1);
            return true;
        }
        else{
            //Not spawned yet, so just skip this object
            return true;
        }
    }
    else if(obj !== undefined){
        if(memoryObj.memory.hasSpawned.indexOf(name) < 0){
            memoryObj.memory.hasSpawned.push(name);
        }
    }
    
    return false;
}

module.exports = {
    screepIsDead:screepIsDead,
    createNextCreep:createNextCreep
}