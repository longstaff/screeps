var Constants = require('const');

function makeCreep(spawn, object, roomLevel){
    var array;

	switch(object.type){
	    case Constants.CREEP_DEFENCE:
	        array = makeDefenceRangeCreep(roomLevel);
	        break;
	    case Constants.CREEP_OFFENCE:
	        array = makeOffenceRangeCreep(roomLevel);
	        break;

	    case Constants.CREEP_HARVESTER:
	        array = makeHarvesterCreep(roomLevel);
	        break;
	    case Constants.CREEP_HARVESTER_MINER:
	        array = makeHarvesterMinerCreep(roomLevel);
	        break;
	    case Constants.CREEP_HARVESTER_CARRY:
	        array = makeHarvesterCarryCreep(roomLevel);
	        break;

	    case Constants.CREEP_WORKER:
	        array = makeWorkerCreep(roomLevel);
	        break;
	    case Constants.CREEP_WORKER_MINER:
	        array = makeWorkerMinerCreep(roomLevel);
	        break;
	    case Constants.CREEP_WORKER_CARRY:
	        array = makeWorkerCarryCreep(roomLevel);
	        break;

        case Constants.CREEP_CAMPER:
            array = makeCamperCreep(roomLevel);
            break;
	}

    object.memory.job = object.type;
	return spawn.createCreep(array, undefined, object.memory);
}

function makeCamperCreep(roomLevel){
    var array = [MOVE, MOVE, ATTACK];
    if(roomLevel > 3){
        array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
    }
    if(roomLevel > 2){
        array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
    }
    if(roomLevel > 1){
        array = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK];
    }
    return array;
}

function makeDefenceShortCreep(roomLevel){
	var array = [MOVE, MOVE, ATTACK];
	if(roomLevel > 3){
		array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK];
	}
	if(roomLevel > 2){
		array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK];
	}
	if(roomLevel > 1){
		array = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK];
	}
	return array;
}
function makeDefenceRangeCreep(roomLevel){
	var array = [MOVE, MOVE, RANGED_ATTACK];
	if(roomLevel > 3){
		array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
	}
	if(roomLevel > 2){
		array = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK];
	}
	if(roomLevel > 1){
		array = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK];
	}
	return array;
}
function makeOffenceShortCreep(roomLevel){
	var array = [TOUGH, TOUGH, MOVE, ATTACK];
	return array;
}
function makeOffenceRangeCreep(roomLevel){
	var array = [TOUGH, TOUGH, MOVE, RANGED_ATTACK];
	return array;
}
function makeOffenceHealCreep(roomLevel){
	var array = [TOUGH, TOUGH, MOVE, HEAL];
	return array;
}
function makeHarvesterCreep(roomLevel){
	var array = [WORK, CARRY, MOVE, MOVE];
	if(roomLevel > 3){
		array = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
	}
	if(roomLevel > 2){
		array = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
	}
	if(roomLevel > 1){
		array = [WORK, WORK, CARRY, MOVE, MOVE];
	}
	return array;
}
function makeHarvesterMinerCreep(roomLevel){
	var array = [WORK, WORK, CARRY, MOVE];
	if(roomLevel > 3){
		array = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
	}
	if(roomLevel > 2){
		array = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
	}
	if(roomLevel > 1){
		array = [WORK, WORK, WORK, CARRY, MOVE];
	}
	return array;
}
function makeHarvesterCarryCreep(roomLevel){
	var array = [CARRY, CARRY, CARRY, MOVE, MOVE];
	if(roomLevel > 3){
		array = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
	}
	if(roomLevel > 2){
		array = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
	}
	if(roomLevel > 1){
		array = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
	}
	return array;
}
function makeWorkerCreep(roomLevel){
	var array = [WORK, CARRY, CARRY, MOVE, MOVE];
	if(roomLevel > 3){
		array = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
	}
	if(roomLevel > 2){
		array = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
	}
	if(roomLevel > 1){
		array = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
	}
	return array;
}
function makeWorkerMinerCreep(roomLevel){
	var array = [WORK, WORK, CARRY, MOVE];
	if(roomLevel > 3){
		array = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
	}
	if(roomLevel > 2){
		array = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
	}
	if(roomLevel > 1){
		array = [WORK, WORK, WORK, CARRY, MOVE];
	}
	return array;
}
function makeWorkerCarryCreep(roomLevel){
	var array = [CARRY, CARRY, CARRY, MOVE, MOVE];
	if(roomLevel > 3){
		array = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
	}
	if(roomLevel > 2){
		array = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
	}
	if(roomLevel > 1){
		array = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
	}
	return array;
}

module.exports = {
    makeCreep:makeCreep
}
