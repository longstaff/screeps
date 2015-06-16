var Defence = require('defenceCreep');
var Harvest = require('harvestCreep');
var Worker = require('workerCreep');
var Offence = require('offenceCreep');
var Constants = require('const');
var StructureMaker = require('structureMaker');
var CreepMaker = require('creepMaker');

module.exports = function (flag) {

    if(!flag.room) return;
    
	var currentState = flag.memory.state;
	var spawn = flag.pos.findClosest(FIND_MY_SPAWNS);
	if(!spawn){
	    var spawn = Game.spawns[flag.memory.spawn];
	}

	if(!flag.memory.screeps){
		flag.memory.screeps = [];
	}
	if(!flag.memory.hasSpawned){
		flag.memory.hasSpawned = [];
	}
	if(!flag.memory.buildingSites){
		flag.memory.buildingSites = [];
	}
	if(!flag.memory.controlLevel){
	    flag.memory.controlLevel = 0;
	}
	if(!flag.memory.extensions){
	    flag.memory.extensions = 0;
	}
	if(!flag.memory.notYet){
	    flag.memory.notYet = [];
	}

	var creeps = flag.memory.screeps;
	var hasSpawned = flag.memory.hasSpawned;

    var defenceCreeps = 0;
    var offenceCreeps = 0;
    var workerCreeps = 0;
    var workerMinerCreeps = 0;
    var workerCarryCreeps = 0;
    var harvesterCreeps = 0;
    var harvesterMinerCreeps = 0;
    var harvesterCarryCreeps = 0;
    var totalCreeps = 0;

    var buildSites = [];
    var activeSites = flag.room.find(FIND_CONSTRUCTION_SITES);
    for(var sites in activeSites){
        if(flag.memory.notYet.indexOf(activeSites[sites].id)){
            buildSites.push(activeSites[sites]);
        }
    }

	for(var creep in creeps) {
        var creepObj = Game.creeps[creeps[creep]];
        if(creepObj && !CreepMaker.screepIsDead(flag, creeps[creep], creepObj)){

            switch(creepObj.memory.job){
                case Constants.CREEP_DEFENCE:
                    defenceCreeps ++;
                    totalCreeps ++;
                    break;
                case Constants.CREEP_OFFENCE_HEAL:
                case Constants.CREEP_OFFENCE:
                    offenceCreeps ++;
                    totalCreeps ++;
                    break;
                case Constants.CREEP_WORKER:
                    workerCreeps ++;
                    totalCreeps ++;
                    break;
                case Constants.CREEP_WORKER_MINER:
                    workerMinerCreeps ++;
                    totalCreeps ++;
                    break;
                case Constants.CREEP_WORKER_CARRY:
                    workerCarryCreeps ++;
                    totalCreeps ++;
                    break;
                case Constants.CREEP_HARVESTER:
                    harvesterCreeps ++;
                    totalCreeps ++;
                    break;
                case Constants.CREEP_HARVESTER_MINER:
                    harvesterMinerCreeps ++;
                    totalCreeps ++;
                    break;
                case Constants.CREEP_HARVESTER_CARRY:
                    harvesterCarryCreeps ++;
                    totalCreeps ++;
                    break;
            }
		}
	}

	//Set state
	setState();
	currentState = flag.memory.state;

    function setState(){
		if(flag.memory.checked !== true){
		    if(offenceCreeps === 0){
		        flag.memory.checking = false;
		    }

		    if(offenceCreeps < 5 && !flag.memory.checking){
		        flag.memory.state = Constants.STATE_AMASS;
		    }
		    else{
		        flag.memory.checking = true;
		        flag.memory.state = Constants.STATE_CHECK;
		    }
		}
		else{
            if(harvesterCreeps + harvesterCarryCreeps + harvesterMinerCreeps < 6){
                flag.memory.state = Constants.STATE_HARVEST;
            }
            else if(defenceCreeps < 5){
                flag.memory.state = Constants.STATE_DEFENCE;
            }
    		else if(canExpand()){
    		    flag.memory.state = Constants.STATE_EXPAND;
    		}
    		else if(spawn.room.controller && spawn.room.controller.level < 3){
    		    flag.memory.state = Constants.STATE_STORE;
    		}
    		else{
    		    flag.memory.state = Constants.STATE_SPREAD;
    		}
		}
	}
	function canExpand(){
	    if(flag.room.controller){

    	    if(flag.memory.extensions <= 10){
        	    if(StructureMaker.createNewExtension(flag)){
        	        flag.memory.extensions = flag.memory.extensions +1;
        	    }
    	    }

    	    if(flag.room.controller.level > 2 && flag.memory.controlLevel !== flag.room.controller.level){
    	        StructureMaker.createRoads(flag);
    	    }

    	    if(flag.memory.controlLevel !== flag.room.controller.level){
    	        flag.memory.controlLevel = flag.room.controller.level;
    	        flag.memory.notYet = [];
    	    }
    	    var leftSites = [];
    	    var activeSites = flag.room.find(FIND_CONSTRUCTION_SITES);
    	    for(var sites in activeSites){
    	        if(flag.memory.notYet.indexOf(activeSites[sites])){
    	            leftSites.push();
    	        }
    	    }

    	    if(leftSites.length > 0){
    	        return true;
    	    }
    	    else{
    	        return false;
	        }
	    }
	    else{
	        //No controller, cant build here.
	        return false;
        }
	}


    //Create new creep
    if(currentState === Constants.CREEP_DEFENCE || totalCreeps <= 18){
        var extensionCount = 0;
        var extensions = flag.room.find(FIND_MY_STRUCTURES, {
            filter: function(i) {
                return i.structureType === STRUCTURE_EXTENSION;
            }
        });
        if(extensions) extensionCount = extensions.length;

        switch(currentState){
            case Constants.STATE_AMASS:
                if(offenceCreeps == 0){
                    CreepMaker.makeOffenceHealCreep(flag, spawn, extensionCount);
                }
                else if(offenceCreeps%2 == 0){
                    CreepMaker.makeOffenceRangeCreep(flag, spawn, extensionCount);
                }
                else{
                    CreepMaker.makeOffenceShortCreep(flag, spawn, extensionCount);
                }
                break;
            case Constants.STATE_HARVEST:
                if(extensionCount === 0 && harvesterCreeps < 2){
                    //Generic ones to start you off
                    CreepMaker.makeHarvesterCreep(flag, spawn, extensionCount);
                }
                else if(harvesterMinerCreeps < 2){
                    //A couple of miners
                    CreepMaker.makeHarvesterMinerCreep(flag, spawn, extensionCount);
                }
                else{
                    //The rest are carrying energy
                    CreepMaker.makeHarvesterCarryCreep(flag, spawn, extensionCount);
                }
                break;
            case Constants.STATE_DEFENCE:
                if(defenceCreeps%2 == 0){
                    CreepMaker.makeDefenceRangeCreep(flag, spawn, extensionCount);
                }
                else{
                    CreepMaker.makeDefenceShortCreep(flag, spawn, extensionCount);
                }
                break;
            case Constants.STATE_EXPAND:
                if(spawn.room.controller){
                    CreepMaker.makeWorkerCreep(flag, spawn, extensionCount);
                }
                break;
            case Constants.STATE_SPREAD:
            case Constants.STATE_STORE:
                if(extensionCount === 0 && workerCreeps < 2){
                    //Generic ones to start you off
                    CreepMaker.makeWorkerCreep(flag, spawn, extensionCount);
                }
                else if(workerMinerCreeps < 2){
                    //A couple of miners
                    CreepMaker.makeWorkerMinerCreep(flag, spawn, extensionCount);
                }
                else{
                    //The rest are carrying energy
                    CreepMaker.makeWorkerCarryCreep(flag, spawn, extensionCount);
                }
                break;
        }

    }


    var completeOffence = 0;
	//Tell creeps to do something
	for(var creep in creeps) {
		var creepObj = Game.creeps[creeps[creep]];

		if(!CreepMaker.screepIsDead(flag, creeps[creep], creepObj)){

    		if(creepObj.memory.job === Constants.CREEP_DEFENCE) {
                Defence(flag, creepObj);
    		}
    		if(creepObj.memory.job === Constants.CREEP_OFFENCE) {
                if(Offence(flag, spawn, creepObj, currentState, true)){
                    completeOffence = completeOffence+1;
                }
    		}

            if(creepObj.memory.job === Constants.CREEP_HARVESTER ||
                creepObj.memory.job === Constants.CREEP_HARVESTER_MINER ||
                creepObj.memory.job === Constants.CREEP_HARVESTER_CARRY) {
                Harvest(flag, spawn, creepObj);
            }

            if(creepObj.memory.job === Constants.CREEP_WORKER ||
                creepObj.memory.job === Constants.CREEP_WORKER_MINER ||
                creepObj.memory.job === Constants.CREEP_WORKER_CARRY) {
                if((currentState === Constants.STATE_DEFENCE || currentState === Constants.STATE_HARVEST) && harvesterCreeps + harvesterCarryCreeps < 2){
                    Harvest(flag, spawn, creepObj);
                }
                else{
                    Worker(flag, spawn, creepObj, currentState, buildSites);
                }
            }
		}
	}

	if(completeOffence >= offenceCreeps && offenceCreeps > 0){
	    flag.memory.checked = true;
	}
}
