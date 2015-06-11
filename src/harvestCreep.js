var Constants = require('const');

module.exports = function (object, spawn, creepObj) {
    var target = object;
    //Test if a spawn or a flag
    if(!object.energyCapacity){
        var extensions = object.pos.findInRange(FIND_MY_STRUCTURES, 15);
        if(extensions.length === 0){
            target = spawn;
        }
        else{
            for(var struct in extensions){
                if(extensions[struct].structureType === STRUCTURE_EXTENSION && extensions[struct].energy < extensions[struct].energyCapacity){
                    target = extensions[struct];
                    break;
                }
            }
        }
    }
    else{
        target = spawn;
    }

    if(target === spawn && spawn.energy === spawn.energyCapacity){

        var extensions = spawn.pos.findInRange(FIND_MY_STRUCTURES, 15);
        for(var struct in extensions){
            if(extensions[struct].structureType === STRUCTURE_EXTENSION && extensions[struct].energy < extensions[struct].energyCapacity){
                target = extensions[struct];
                break;
            }
        }
    }

    //Put it somewhere
    if(creepObj.energy < creepObj.energyCapacity) {

        var steal = false;
        var creepsNear = creepObj.pos.findInRange(FIND_MY_CREEPS, 1);
        if(creepsNear.length){
            for(var creep in creepsNear){
                if(!creepObj.memory.stolenBy || creepObj.memory.stolenBy !== creep){
                    if(creepsNear[creep].memory.job === Constants.CREEP_HARVESTER && creepsNear[creep].energy > 0){
                        var closest = object.pos.findClosest([creepObj, creepsNear[creep]]);
                        if(closest === creepObj){
                            creepsNear[creep].transferEnergy(creepObj);
                            creepsNear[creep].memory.stolenBy = creepObj.name;
                            creepsNear[creep].cancelOrder("moveToRoomObject");
                            creepsNear[creep].cancelOrder("moveToRoomPosition");
                            steal = true;
                            if(creepObj.energy === creepObj.energyCapacity){
                                break;
                            }
                        }
                    }
                }
            }
        }
        else{
            creepObj.memory.stolenBy = null;
        }
        
        if(!steal || creepObj.energy < creepObj.energyCapacity){
            var sources = object.pos.findInRange(FIND_SOURCES, 10);
            creepObj.moveToRoomObject(sources[0]);
            creepObj.harvest(sources[0]);
        }
        else{
            if(target === spawn && target.energy === target.energyCapacity){
                creepObj.moveToRoomPosition(target.pos.x+3, target.pos.y, target.room);
            }
            else{
                creepObj.moveToRoomObject(target);
                creepObj.transferEnergy(target);
            }
        }

    }
    else {
        
        if(target === spawn && target.energy === target.energyCapacity){
            creepObj.moveToRoomPosition(target.pos.x+3, target.pos.y, target.room);
        }
        else{
            creepObj.moveToRoomObject(target);
            creepObj.transferEnergy(target);
        }
    }
}
