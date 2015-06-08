module.exports = function (spawn) {

	var CREEP_DEFENCE = "DEFENCE";
	var CREEP_OFFENCE = "OFFENCE";
	var CREEP_WORKER = "WORKER";
	var CREEP_HARVESTER = "HARVESTER";

	var STATE_DEFENCE = "DEFENCE";
	var STATE_STORE = "STORE";
	var STATE_EXPAND = "EXPAND";
	var STATE_SPREAD = "SPREAD";
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
				case CREEP_DEFENCE:
					defenceCreeps ++;
					break;
				case CREEP_OFFENCE:
					offenceCreeps ++;
					break;
				case CREEP_WORKER:
					workerCreeps ++;
					break;
				case CREEP_HARVESTER:
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
		    spawn.memory.state = STATE_DEFENCE;
		}
		else if(canExpand()){
		    spawn.memory.state = STATE_EXPAND;
		}
		else if(spawn.room.controller && spawn.room.controller.level < 3){
		    spawn.memory.state = STATE_STORE;
		}
		else{
		    spawn.memory.state = STATE_SPREAD;
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
			case STATE_DEFENCE:
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
			case STATE_EXPAND:
				makeWorkerCreep();
				break;
			case STATE_STORE:
				makeWorkerCreep();
				break;
		    case STATE_SPREAD:
				makeWorkerCreep();
		        //makeOffenceCreep();
		        break;
		}
	}

	function makeDefenceShortCreep(){
    	var creep = spawn.createCreep([MOVE, MOVE, ATTACK], undefined, {job:CREEP_DEFENCE});
    	if(typeof(creep) === "string"){
    		spawn.memory.screeps.push(creep);
    	}
	}
	function makeDefenceRangeCreep(){
    	var creep = spawn.createCreep([TOUGH, MOVE, RANGED_ATTACK], undefined, {job:CREEP_DEFENCE});
    	if(typeof(creep) === "string"){
    		spawn.memory.screeps.push(creep);
    	}
	}
	function makeOffenceShortCreep(){
    	var creep = spawn.createCreep([TOUGH, TOUGH, MOVE, ATTACK], undefined, {job:CREEP_OFFENCE});
    	if(typeof(creep) === "string"){
    		spawn.memory.screeps.push(creep);
    	}
	}
	function makeOffenceRangeCreep(){
    	var creep = spawn.createCreep([TOUGH, TOUGH, MOVE, RANGED_ATTACK], undefined, {job:CREEP_OFFENCE});
    	if(typeof(creep) === "string"){
    		spawn.memory.screeps.push(creep);
    	}
	}
	function makeHarvesterCreep(){
    	var creep = spawn.createCreep([WORK, CARRY, MOVE], undefined, {job:CREEP_HARVESTER});
    	if(typeof(creep) === "string"){
    		spawn.memory.screeps.push(creep);
    	}
	}
	function makeWorkerCreep(){
    	var creep = spawn.createCreep([WORK, WORK, CARRY, CARRY, MOVE], undefined, {job:CREEP_WORKER});
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

    		if(creepObj.memory.job === CREEP_DEFENCE || creepObj.memory.job === CREEP_OFFENCE) {
	            var targets = spawn.pos.findInRange(FIND_HOSTILE_CREEPS, 15);
    			if(targets && targets.length) {
        			creepObj.moveTo(targets[0]);
                    if(creepObj.getActiveBodyparts(RANGED_ATTACK) > 0){
    				    creepObj.rangedAttack(targets[0]);
                    }
                    if(creepObj.getActiveBodyparts(ATTACK) > 0){
    				    creepObj.attack(targets[0]);
                    }
    			}
    			else{
    			    var pos = spawn.pos;
    				creepObj.moveTo(pos.x, pos.y + 5);
    			}
    		}
    
    		if(creepObj.memory.job === CREEP_HARVESTER) {
    			if(creepObj.energy < creepObj.energyCapacity) {
	                var sources = spawn.pos.findInRange(FIND_SOURCES, 10);
    				creepObj.moveTo(sources[0]);
    				creepObj.harvest(sources[0]);
    			}
    			else {
    			    var target = spawn;
    			    if(spawn.energy === spawn.energyCapacity){
    			        
    			        var extensions = spawn.pos.findInRange(FIND_MY_STRUCTURES, 15);
    			        for(var struct in extensions){
    			            if(extensions[struct].structureType === STRUCTURE_EXTENSION && extensions[struct].energy < extensions[struct].energyCapacity){
    			                target = extensions[struct];
    			            }
    			        }
    			    }
    				creepObj.moveTo(target);
    				creepObj.transferEnergy(target);
    			}
    
    		}
    		
    		if(creepObj.memory.job === CREEP_WORKER) {
    		    
			    if(creepObj.energy === 0){
			        creepObj.memory.task = "recharge";
			    }
    		    else if(creepObj.energy === creepObj.energyCapacity && currentState === STATE_EXPAND){
			        creepObj.memory.task = "build";
    		    }
    		    else if(creepObj.energy === creepObj.energyCapacity){
			        creepObj.memory.task = "store";
    		    }
    		    
    			if(creepObj.memory.task === "build" || creepObj.memory.task === "store") {
    			    
    			    var repairing = false;
    			    if(!maintainWorker){
    			        
    			        maintainWorker = true;
    			        
    			        var currentStructure = spawn.memory.repairingId;
    			        var repairTarget;
    			        
    			        if(currentStructure){
    			            if(Game.structures[currentStructure] && Game.structures[currentStructure].hits < Game.structures[currentStructure].hitsMax){
    			                //Stick with one until completely fixed
    			                repairTarget = Game.structures[currentStructure];
    			            }
    			            else{
    			                //Clear to allow for the next one
    			                spawn.memory.repairingId = null;
    			            }
    			        }
    			        
    			        //TODO: FIND ROADS!!!!
    			        if(!repairTarget){
    			            //If none locked on, scan to find a new one
    			            var structures = spawn.room.find(FIND_MY_STRUCTURES);
    			            for(var repair in structures){
        			            if(structures[repair].hits < structures[repair].hitsMax/2){
        			                //Save ID and assign as current target
    			                    spawn.memory.repairingId = structures[repair].id;
    			                    repairTarget = structures[repair];
                    				break;
        			            }
        			        }
    			        }
    			        
    			        //If there is a target, fix it!
    			        if(repairTarget){
            			    creepObj.moveTo(repairTarget);
            				creepObj.repair(repairTarget);
            				repairing = true;
    			        }
    			        
    			    }
    			    
    			    if(!repairing){
        			    //var sites = spawn.pos.findClosest(FIND_CONSTRUCTION_SITES);
        			    //var sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
            			if(buildSites.length > 0){
            			    creepObj.moveTo(buildSites[0]);
            				var result = creepObj.build(buildSites[0]);
            				if(result === -14){
                                spawn.memory.notYet.push(buildSites[0].id);
            				}
            			}
            			else{
            			    
            			    if(creepObj.pos.isNearTo(spawn.room.controller)){
                				creepObj.upgradeController(spawn.room.controller);
            			    }
            			    else if(creepObj.memory.givingEnergy){
            			        var closestCreep = Game.creeps[creepObj.memory.givingEnergy];
                				creepObj.moveTo(closestCreep);
                				creepObj.transferEnergy(closestCreep);
                				if(creepObj.energy === 0){
                				    creepObj.memory.givingEnergy = null;
                				}
            			    }
            			    else{
            			        //Look for empty space
                			    var contPos = spawn.room.controller.pos;
                			    var objs = spawn.room.lookAtArea(contPos.y-1, contPos.x-1, contPos.y+1, contPos.x+1);
                			    var spaceCount = 9;
                			    var creepsArea = [];
                			    
                			    for(var rows in objs){
                			        for(var cols in objs[rows]){
                			            for(var obj in objs[rows][cols]){
                    			            if(objs[rows][cols][obj].type === "creep"){
                    			                creepsArea.push(objs[rows][cols][obj].creep.name);
                    			                spaceCount --;
                    			            }
                    			            if(objs[rows][cols][obj].type === "terrain" && objs[rows][cols][obj].terrain === "wall"){
                    			                spaceCount --;
                    			            }
                			            }
                			        }
                			    }
                			    
                			    if(spaceCount === 0){
                			        var closestCreep;
                			        var energy = 9999999;
                			        for(var creep in creepsArea){
                			            if(Game.creeps[creepsArea[creep]].energy < energy){
                			                closestCreep = Game.creeps[creepsArea[creep]];
                			                energy = Game.creeps[creepsArea[creep]].energy;
                			            }
                			        }
                    				creepObj.moveTo(closestCreep);
                    				var res = creepObj.transferEnergy(closestCreep);
                    				if(res === 0){
                    				    creepObj.memory.givingEnergy = closestCreep.name;
                    				}
                			    }
                			    else{
                    				creepObj.moveTo(spawn.room.controller);
                    				creepObj.upgradeController(spawn.room.controller);
                			    }
            			    }
            			    
            			}
    			    }
    			}
    			else {
    				creepObj.moveTo(spawn);
                	creepObj.memory.givingEnergy = null;
    				//IF NEEDED STORE ENERGY FOR CREATING NEW DEFENCE CREEPS
    				if(currentState !== STATE_DEFENCE){
    				    spawn.transferEnergy(creepObj);
    				}
    			}
    
    		}
    		
		}

	}
}