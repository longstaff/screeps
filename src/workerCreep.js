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
    if(creepObj.memory.job !== Constants.CREEP_WORKER_CARRY){
        //If you are a carryer, dont steal
        var creepsNear = creepObj.pos.findInRange(FIND_MY_CREEPS, 1);
        if(creepsNear.length){
            for(var creep in creepsNear){
                if(!creepObj.memory.stolenBy || creepObj.memory.stolenBy !== creepsNear[creep].name){
                    if((
                        creepsNear[creep].memory.job === Constants.CREEP_HARVESTER ||
                        creepsNear[creep].memory.job === Constants.CREEP_HARVESTER_CARRY ||
                        creepsNear[creep].memory.job === Constants.CREEP_WORKER ||
                        creepsNear[creep].memory.job === Constants.CREEP_WORKER_CARRY
                    ) && creepsNear[creep].energy > 0){
                        var closest = target.pos.findClosest([creepObj, creepsNear[creep]]);
                        //Always take from a carryer
                        if(closest === creepObj || creepsNear[creep].memory.job === Constants.CREEP_WORKER_CARRY){
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

        if(creepObj.memory.job === Constants.CREEP_WORKER_CARRY){
            //If a carryer, find the closest miner to give to.
            var sources = object.room.find(FIND_MY_CREEPS, {
                filter:function(i){
                    return (i.memory.job === Constants.CREEP_WORKER_MINER || i.memory.job === Constants.CREEP_WORKER) && i.energy < i.energyCapacity;
                }
            });
            if(sources.length){
                creepObj.moveToRoomObject(sources[0]);
                creepObj.transferEnergy(sources[0]);
            }
            else{
                creepObj.moveToRoomObject(target);
            }
        }
        else{
            var repairing = false;
            var building = false;

            var currentStructure = creepObj.memory.repairingId;
            var repairTarget;

            if(buildSites.length > 0){
                creepObj.moveToRoomObject(buildSites[0]);
                var result = creepObj.build(buildSites[0]);
                if(result === -14){
                    object.memory.notYet.push(buildSites[0].id);
                }
                building = true;
            }

            if(!building && currentStructure){
                if(Game.structures[currentStructure] && Game.structures[currentStructure].hits < Game.structures[currentStructure].hitsMax){
                    //Stick with one until completely fixed
                    repairTarget = Game.structures[currentStructure];
                }
                else{
                    //Clear to allow for the next one
                    creepObj.memory.repairingId = null;
                }
            }

            if(!building && !repairTarget){
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

            if(!building && !repairing){

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
                if(object.energy === 0 || (currentState === Constants.STATE_DEFENCE && currentState === Constants.STATE_HARVEST)){
                    creepObj.moveToRoomPosition(object.pos.x+3, object.pos.y, object.room);
                }
                else{
                    creepObj.moveToRoomObject(object);
                    if(currentState !== Constants.STATE_DEFENCE && currentState !== Constants.STATE_HARVEST){
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
