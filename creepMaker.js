var Constants = require('const');

function createNextCreep(memoryObj, spawn, state, offenceCreeps, defenceCreeps, harvesterCreeps){
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
			if(defenceCreeps == 0 || defenceCreeps < harvesterCreeps){
				if(defenceCreeps%2 == 0){
					makeDefenceRangeCreep(memoryObj, spawn);
				}
				else{
					makeDefenceShortCreep(memoryObj, spawn);
				}
			}
			else{
				makeHarvesterCreep(memoryObj, spawn);
			}
			break;
		case Constants.STATE_EXPAND:
			if(memoryObj.room.controller){
				makeWorkerCreep(memoryObj, spawn);
			}
			break;
		case Constants.STATE_STORE:
			if(memoryObj.room.controller){
				makeWorkerCreep(memoryObj, spawn);
			}
			break;
	    case Constants.STATE_SPREAD:
	    	if(memoryObj.room.controller){
				makeWorkerCreep(memoryObj, spawn);
			}
	        //makeOffenceCreep();
	        break;
	}
}

function makeDefenceShortCreep(memoryObj, spawn){
	var creep = spawn.createCreep([MOVE, MOVE, ATTACK], undefined, {job:Constants.CREEP_DEFENCE});
	if(typeof(creep) === "string"){
		memoryObj.memory.screeps.push(creep);
	}
}
function makeDefenceRangeCreep(memoryObj, spawn){
	var creep = spawn.createCreep([TOUGH, MOVE, RANGED_ATTACK], undefined, {job:Constants.CREEP_DEFENCE});
	if(typeof(creep) === "string"){
		memoryObj.memory.screeps.push(creep);
	}
}
function makeOffenceShortCreep(memoryObj, spawn){
	var creep = spawn.createCreep([TOUGH, TOUGH, MOVE, ATTACK], undefined, {job:Constants.CREEP_OFFENCE});
	if(typeof(creep) === "string"){
		memoryObj.memory.screeps.push(creep);
	}
}
function makeOffenceRangeCreep(memoryObj, spawn){
	var creep = spawn.createCreep([TOUGH, TOUGH, MOVE, RANGED_ATTACK], undefined, {job:Constants.CREEP_OFFENCE});
	if(typeof(creep) === "string"){
		memoryObj.memory.screeps.push(creep);
	}
}
function makeHarvesterCreep(memoryObj, spawn){
	var creep = spawn.createCreep([WORK, CARRY, MOVE], undefined, {job:Constants.CREEP_HARVESTER});
	if(typeof(creep) === "string"){
		memoryObj.memory.screeps.push(creep);
	}
}
function makeWorkerCreep(memoryObj, spawn){
	var creep = spawn.createCreep([WORK, WORK, CARRY, CARRY, MOVE], undefined, {job:Constants.CREEP_WORKER});
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