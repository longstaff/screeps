var Constants = require('const');

module.exports = function (object, spawn, creepObj, currentState, buildSites) {

    var target;
    if(buildSites.length > 0){
        target = buildSites[0];
    }
    else{
        target = object.room.controller ? object.room.controller : spawn.room.controller;
    }

    var steal = false;
    var creepsNear = creepObj.pos.findInRange(FIND_MY_CREEPS, 1);
    if(creepsNear.length){
        for(var creep in creepsNear){
            if(!creepObj.memory.stolenBy || creepObj.memory.stolenBy !== creep){
                if((creepsNear[creep].memory.job === Constants.CREEP_WORKER || creepsNear[creep].memory.job === Constants.CREEP_HARVESTER) && creepsNear[creep].energy > 0){
                    var closest = target.pos.findClosest([creepObj, creepsNear[creep]]);
                    if(closest === creepObj){
                        creepsNear[creep].transferEnergy(creepObj);
                        creepsNear[creep].memory.stolenBy = creepObj.name;
                        steal = true;
                        creepObj.memory.stolenBy = null;
                        if(creepObj.energy === creepObj.energyCapacity){
                            break;
                        }
                    }
                }
            }
        }
    }

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
            var targets = [];
            var ramparts = spawn.room.find(FIND_MY_STRUCTURES, {
                filter: function(i) {
                    return i.structureType === STRUCTURE_RAMPART;
                }
            });
            for(var rampart in ramparts){
                if(!ramparts[rampart].pos.isNearTo(spawn) && ramparts[rampart].hits < ramparts[rampart].hitsMax/2){
                    targets.push(ramparts[rampart]);
                }
            }
            var staticObjs = spawn.room.find(FIND_STRUCTURES, {
                filter: function(i) {
                    return i.structureType === STRUCTURE_ROAD || i.structureType === STRUCTURE_WALL;
                }
            });
            for(var staticObj in staticObjs){
                if(staticObjs[staticObj].hits < staticObjs[staticObj].hitsMax/2){
                    targets.push(staticObjs[staticObj]);
                }
            }

            //If none locked on, scan to find a new one
            for(var repair in targets){
                //Save ID and assign as current target
                creepObj.memory.repairingId = targets[repair].id;
                repairTarget = targets[repair];
                break;
            }
        }
        
        //If there is a target, fix it!
        if(repairTarget){
            creepObj.moveToRoomObject(repairTarget);
            creepObj.repair(repairTarget);
            repairing = true;
        }
        
        if(!repairing){

            if(buildSites.length > 0){
                creepObj.moveToRoomObject(buildSites[0]);
                var result = creepObj.build(buildSites[0]);
                if(result === -14){
                    object.memory.notYet.push(buildSites[0].id);
                }
            }
            else{
                var controller = object.room.controller ? object.room.controller : spawn.room.controller;
                creepObj.moveToRoomObject(controller);
                creepObj.upgradeController(controller);                
            }
        }
    }
    else {
        creepObj.memory.givingEnergy = null;

        if(!steal || creepObj.energy < creepObj.energyCapacity){
            if(object.energyCapacity){
                if(object.energy === 0 || currentState === Constants.STATE_DEFENCE){
                    creepObj.moveToRoomPosition(object.pos.x+3, object.pos.y, object.room);
                }
                else{
                    creepObj.moveToRoomObject(object);
                    if(currentState !== Constants.STATE_DEFENCE){
                        object.transferEnergy(creepObj);
                    }
                }
            }
            else{
                //Take from mine instead
                var sources = object.pos.findInRange(FIND_SOURCES, 10);
                creepObj.moveToRoomObject(sources[0]);
                creepObj.harvest(sources[0]);
            }
        }
        else{
            if(buildSites.length > 0){
                creepObj.moveToRoomObject(buildSites[0]);
                var result = creepObj.build(buildSites[0]);
                if(result === -14){
                    object.memory.notYet.push(buildSites[0].id);
                }
            }
            else{
                var controller = object.room.controller ? object.room.controller : spawn.room.controller;
                creepObj.moveToRoomObject(controller);
            }
        }

    }
}