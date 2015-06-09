var Defence = require('defenceCreep');
var Harvest = require('harvestCreep');
var Worker = require('workerCreep');
var Offence = require('offenceCreep');
var Constants = require('const');
var StructureMaker = require('structureMaker');
var CreepMaker = require('creepMaker');

module.exports = function (flag) {
    
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
	var harvesterCreeps = 0;
	
    var buildSites = [];
    var activeSites = flag.room.find(FIND_CONSTRUCTION_SITES);
    for(var sites in activeSites){
        if(flag.memory.notYet.indexOf(activeSites[sites].id)){
            buildSites.push(activeSites[sites]);
        }
    }
	
	for(var creep in creeps) {
        var creepObj = Game.creeps[creeps[creep]];
        if(creepObj && !CreepMaker.screepIsDead(flag, spawn, creeps[creep], creepObj)){
			switch(creepObj.memory.job){
				case Constants.CREEP_DEFENCE:
					defenceCreeps ++;
					break;
				case Constants.CREEP_OFFENCE:
					offenceCreeps ++;
					break;
				case Constants.CREEP_WORKER:
					workerCreeps ++;
					break;
				case Constants.CREEP_HARVESTER:
					harvesterCreeps ++;
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
		    if(defenceCreeps < 6 || harvesterCreeps < 5){
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
	if(creeps.length <= 18){
        CreepMaker.createNextCreep(flag, spawn, currentState, offenceCreeps, defenceCreeps, harvesterCreeps);
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
    
    		if(creepObj.memory.job === Constants.CREEP_HARVESTER) {
                Harvest(flag, spawn, creepObj);
    		}
    		
    		if(creepObj.memory.job === Constants.CREEP_WORKER) {
                Worker(flag, spawn, creepObj, currentState, buildSites);
    		}
		}
	}
	
	if(completeOffence >= offenceCreeps && offenceCreeps > 0){
	    flag.memory.checked = true;
	}
}