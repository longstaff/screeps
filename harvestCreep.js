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
                if(creepsNear[creep].memory.job === Constants.CREEP_HARVESTER && creepsNear[creep].energy > 0){
                    var closest = object.pos.findClosest([creepObj, creepsNear[creep]]);
                    if(closest === creepObj){
                        creepsNear[creep].transferEnergy(creepObj);
                        steal = true;
                        if(creepObj.energy === creepObj.energyCapacity){
                            break;
                        }
                    }
                }
            }
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
        /*
        if(creepObj.room !== target.room){
            var exit = creepObj.room.findExitTo(target.room);
            var pointTo = creepObj.pos.findClosest(exit);
            creepObj.moveTo(pointTo);
        }
        else{
            if(target.energy === spawn.energyCapacity){
                //Get out of the way for the workers
                creepObj.moveTo(target.pos.x+3, target.pos.y);
            }
            else{
                creepObj.moveTo(target);
                creepObj.transferEnergy(target);
            }
        }
        */
    }
}
