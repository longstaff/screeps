var Constants = require('const');

module.exports = function (spawn, creepObj, currentState, buildSites) {

    if(creepObj.energy === 0){
        creepObj.memory.task = "recharge";
    }
    else if(creepObj.energy === creepObj.energyCapacity && currentState === Constants.STATE_EXPAND){
        creepObj.memory.task = "build";
    }
    else if(creepObj.energy === creepObj.energyCapacity){
        creepObj.memory.task = "store";
    }
    
	if(creepObj.memory.task === "build" || creepObj.memory.task === "store") {
	    
	    var repairing = false;
	        
        var currentStructure = creepObj.memory.repairingId;
        var repairTarget;
        
        if(currentStructure){
            if(Game.structures[currentStructure] && Game.structures[currentStructure].hits < Game.structures[currentStructure].hitsMax){
                //Stick with one until completely fixed
                repairTarget = Game.structures[currentStructure];
            }
            else{
                //Clear to allow for the next one
                creepObj.memory.repairingId = null;
            }
        }
        
        //TODO: FIND ROADS!!!!
        if(!repairTarget){
            //If none locked on, scan to find a new one
            var structures = spawn.room.find(FIND_MY_STRUCTURES);
            for(var repair in structures){
	            if(structures[repair].hits < structures[repair].hitsMax/2){
	                //Save ID and assign as current target
                    creepObj.memory.repairingId = structures[repair].id;
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
		if(currentState !== Constants.STATE_DEFENCE){
		    spawn.transferEnergy(creepObj);
		}
    }
}