var Defence = require('defenceCreep');
var Harvest = require('harvestCreep');
var Worker = require('workerCreep');
var Constants = require('const');

module.exports = function (spawn) {

    /*
	var CREEP_DEFENCE = "DEFENCE";
	var CREEP_OFFENCE = "OFFENCE";
	var CREEP_WORKER = "WORKER";
	var CREEP_HARVESTER = "HARVESTER";

	var STATE_DEFENCE = "DEFENCE";
	var STATE_STORE = "STORE";
	var STATE_EXPAND = "EXPAND";
	var STATE_SPREAD = "SPREAD";

    console.log(Constants.CREEP_DEFENCE);
    */

	var currentState = spawn.memory.state;

	if(!spawn.memory.screeps){
		spawn.memory.screeps = [];
	}
	if(!spawn.memory.hasSpawned){
		spawn.memory.hasSpawned = [];
	}
	if(!spawn.memory.buildingSites){
		spawn.memory.buildingSites = [];
	}
	if(!spawn.memory.controlLevel){
	    spawn.memory.controlLevel = 0;
	}
	if(!spawn.memory.extensions){
	    spawn.memory.extensions = 0;
	}
	if(!spawn.memory.extensions){
	    spawn.memory.extensions = 0;
	}
	if(!spawn.memory.notYet){
	    spawn.memory.notYet = [];
	}
	
	var creeps = spawn.memory.screeps;
	var hasSpawned = spawn.memory.hasSpawned;

    var defenceCreeps = 0;
	var offenceCreeps = 0;
	var workerCreeps = 0;
	var harvesterCreeps = 0;
	
    var buildSites = [];
    var activeSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
    for(var sites in activeSites){
        if(spawn.memory.notYet.indexOf(activeSites[sites].id)){
            buildSites.push(activeSites[sites]);
        }
    }
	
	for(var creep in creeps) {
        var creepObj = Game.creeps[creeps[creep]];
        
        if(!screepIsDead(creeps[creep], creepObj)){
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
	currentState = spawn.memory.state;

	function setState(){
		//TODO: set states
		if(defenceCreeps < 5 || harvesterCreeps < 5){
		    spawn.memory.state = Constants.STATE_DEFENCE;
		}
		else if(canExpand()){
		    spawn.memory.state = Constants.STATE_EXPAND;
		}
		else if(spawn.room.controller && spawn.room.controller.level < 3){
		    spawn.memory.state = Constants.STATE_STORE;
		}
		else{
		    spawn.memory.state = Constants.STATE_SPREAD;
		}
	}
	function canExpand(){
	    if(spawn.memory.extensions <= 10){
    	    if(createNewExtension(spawn.memory.extensions)){
    	        spawn.memory.extensions = spawn.memory.extensions +1;
    	    }
	    }
	    
	    if(spawn.room.controller.level > 2 && spawn.memory.controlLevel !== spawn.room.controller.level){
	        createRoads();
	    }
	    
	    
	    var leftSites = [];
	    var activeSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
	    for(var sites in activeSites){
	        if(spawn.memory.notYet.indexOf(activeSites[sites])){
	            leftSites.push();
	        }
	    }
	    
	    if(spawn.memory.controlLevel !== spawn.room.controller.level){
	        spawn.memory.controlLevel = spawn.room.controller.level;
	        spawn.memory.notYet = [];
	    }
	    
	    if(leftSites.length > 0){
	        return true;
	    }
	    else{
	        return false;
	    }
	}
	function createNewExtension(extNum){
	    
	    var buildPos = spawn.pos;
	    var construct = -7;
	    var i = 0;
	    
	    for(var i=0; i<25; i++){
	        construct = spawn.room.createConstructionSite(buildPos.x -2 + (i % 5), buildPos.y -7 + (2*Math.floor(i / 5)), STRUCTURE_EXTENSION);
	        
	        if(construct !== -7 && construct !== -10){
	            break;
	        }
	    }
	    /*
	    do{
	        construct = spawn.room.createConstructionSite(buildPos.x -2 + (i % 5), buildPos.y -7 + (2*Math.floor(i / 5)), STRUCTURE_EXTENSION);
	        console.log("create new", construct, i);
	        i = i+1;
	    }
	    while(construct !== -7 && construct !== -10);
	    */
	        
	    if(construct != -7 && construct != -10){
	        return true;
	    }
	    else{
	        return false;
	    }
	}
	function createRoads(){
	    var pathToMine;
        var sources = spawn.pos.findInRange(FIND_SOURCES, 10);
        var tiles = [];
        
        roadAroundPoint(spawn.pos, tiles);
        
        for(var source in sources){
            roadAroundPoint(sources[source].pos, tiles);
        }
	    
	    if(spawn.room.controller){
            roadAroundPoint(spawn.room.controller.pos, tiles);
	    }
	    
	    makeRoadOfPath(tiles);
	}
	function roadAroundPoint(point, tiles){
	    for(var i=0; i<9; i++){
            if(i != 4){
                var radPoint = spawn.room.getPositionAt(point.x -1 + (i%3), point.y -1 + (Math.floor(i/3)));
	            addRoadPathTo(tiles, radPoint);
	            var pathToPoint = spawn.room.findPath(radPoint, spawn.pos, {ignoreCreeps:true});
	            
        	    for(var step in pathToPoint){
        	        addRoadPathTo(tiles, pathToPoint[step]);
        	    }
            }
        }
	}
	function addRoadPathTo(arr, point){
	    for(tile in arr){
	        if(arr[tile].x === point.x && arr[tile].y === point.y){
	            //Dont add
	            return;
	        }
	    }
	    arr.push(point);
	}
	function makeRoadOfPath(path){
	    for(var step in path){
	        spawn.room.createConstructionSite(path[step].x, path[step].y, STRUCTURE_ROAD);
	    }
	}
	
	function createNextCreep(state, creeps){
		switch(state){
			case Constants.STATE_DEFENCE:
				if(defenceCreeps == 0 || defenceCreeps < harvesterCreeps){
					if(defenceCreeps%2 == 0){
						makeDefenceRangeCreep();
					}
					else{
						makeDefenceShortCreep();
					}
				}
				else{
					makeHarvesterCreep();
				}
				break;
			case Constants.STATE_EXPAND:
				makeWorkerCreep();
				break;
			case Constants.STATE_STORE:
				makeWorkerCreep();
				break;
		    case Constants.STATE_SPREAD:
				makeWorkerCreep();
		        //makeOffenceCreep();
		        break;
		}
	}

	function makeDefenceShortCreep(){
    	var creep = spawn.createCreep([MOVE, MOVE, ATTACK], undefined, {job:Constants.CREEP_DEFENCE});
    	if(typeof(creep) === "string"){
    		spawn.memory.screeps.push(creep);
    	}
	}
	function makeDefenceRangeCreep(){
    	var creep = spawn.createCreep([TOUGH, MOVE, RANGED_ATTACK], undefined, {job:Constants.CREEP_DEFENCE});
    	if(typeof(creep) === "string"){
    		spawn.memory.screeps.push(creep);
    	}
	}
	function makeOffenceShortCreep(){
    	var creep = spawn.createCreep([TOUGH, TOUGH, MOVE, ATTACK], undefined, {job:Constants.CREEP_OFFENCE});
    	if(typeof(creep) === "string"){
    		spawn.memory.screeps.push(creep);
    	}
	}
	function makeOffenceRangeCreep(){
    	var creep = spawn.createCreep([TOUGH, TOUGH, MOVE, RANGED_ATTACK], undefined, {job:Constants.CREEP_OFFENCE});
    	if(typeof(creep) === "string"){
    		spawn.memory.screeps.push(creep);
    	}
	}
	function makeHarvesterCreep(){
    	var creep = spawn.createCreep([WORK, CARRY, MOVE], undefined, {job:Constants.CREEP_HARVESTER});
    	if(typeof(creep) === "string"){
    		spawn.memory.screeps.push(creep);
    	}
	}
	function makeWorkerCreep(){
    	var creep = spawn.createCreep([WORK, WORK, CARRY, CARRY, MOVE], undefined, {job:Constants.CREEP_WORKER});
    	if(typeof(creep) === "string"){
    		spawn.memory.screeps.push(creep);
    	}
	}

    function screepIsDead(name, obj){
        if(obj === undefined){
            if(spawn.memory.hasSpawned.indexOf(name) >= 0){
                //Has been spawned, so kill this object
                spawn.memory.hasSpawned.splice(spawn.memory.hasSpawned.indexOf(name), 1);
                spawn.memory.screeps.splice(spawn.memory.screeps.indexOf(name), 1);
                return true;
            }
            else{
                //Not spawned yet, so just skip this object
                return true;
            }
        }
        else if(obj !== undefined){
            if(spawn.memory.hasSpawned.indexOf(name) < 0){
                spawn.memory.hasSpawned.push(name);
            }
        }
        
        return false;
    }

	//Create new creep
	if(creeps.length <= 18){
		createNextCreep(currentState, creeps);
	}
    var maintainWorker = false;

	//Tell creeps to do something
	for(var creep in creeps) {
		var creepObj = Game.creeps[creeps[creep]];

		if(!screepIsDead(creeps[creep], creepObj)){

    		if(creepObj.memory.job === Constants.CREEP_DEFENCE || creepObj.memory.job === Constants.CREEP_OFFENCE) {
                Defence(spawn, creepObj);
    		}
    
    		if(creepObj.memory.job === Constants.CREEP_HARVESTER) {
                Harvest(spawn, creepObj);
    		}
    		
    		if(creepObj.memory.job === Constants.CREEP_WORKER) {
                Worker(spawn, creepObj, currentState, buildSites);
    		}
    		
		}

	}
}