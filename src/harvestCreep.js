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
        if(creepObj.memory.job !== Constants.CREEP_HARVESTER_MINER){
            //If you are a miner, dont steal
            var creepsNear = creepObj.pos.findInRange(FIND_MY_CREEPS, 1);
            if(creepsNear.length){
                for(var creep in creepsNear){
                    if(!creepObj.memory.stolenBy || creepObj.memory.stolenBy !== creepsNear[creep].name){

                        if((creepsNear[creep].memory.job === Constants.CREEP_HARVESTER ||
                            creepsNear[creep].memory.job === Constants.CREEP_HARVESTER_MINER ||
                            creepsNear[creep].memory.job === Constants.CREEP_HARVESTER_CARRY
                            ) && creepsNear[creep].energy > 0){

                            var closest = target.pos.findClosest([creepObj, creepsNear[creep]]);
                            if(closest === creepObj || (creepObj.memory.job === Constants.CREEP_HARVESTER_CARRY && creepsNear[creep].memory.job !== Constants.CREEP_HARVESTER_CARRY) ){
                                creepsNear[creep].transferEnergy(creepObj);
                                creepsNear[creep].memory.stolenBy = creepObj.name;
                                creepsNear[creep].cancelOrder("moveTo");
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
        }


        if(!steal || creepObj.energy < creepObj.energyCapacity){
            if(creepObj.memory.job === Constants.CREEP_HARVESTER_CARRY){
                //If a carryer, find the closest miner to steal from.
                var sources = object.pos.findInRange(FIND_SOURCES, 10);
                var closest = sources[0].pos.findInRange(FIND_MY_CREEPS, 2, {
                    filter:function(i){
                        return (i.memory.job === Constants.CREEP_HARVESTER_MINER || i.memory.job === Constants.CREEP_HARVESTER);
                    }
                });

                if(closest.length){
                    var most;
                    var mostEn = 0;
                    for(var close in closest){
                        if(closest[close].energy > mostEn){
                            mostEn = closest[close].energy > mostEn;
                            most = closest[close];
                        }
                    }

                    creepObj.moveToRoomObject(most);
                    most.transferEnergy(creepObj);
                }
                else{
                    creepObj.moveToRoomPosition(target.pos.x, target.pos.y+2, target.room);
                }

            }
            else{
                //Else harvest if you can.
                var sources = object.pos.findInRange(FIND_SOURCES, 10);
                creepObj.moveToRoomObject(sources[0]);
                creepObj.harvest(sources[0]);
            }
        }
        else{
            //If you are a miner, wait for someone to take the energy from you.
            if(creepObj.memory.job !== Constants.CREEP_HARVESTER_MINER){
                if(target === spawn && target.energy === target.energyCapacity){
                    creepObj.moveToRoomPosition(target.pos.x+3, target.pos.y, target.room);
                }
                else{
                    creepObj.moveToRoomObject(target);
                    creepObj.transferEnergy(target);
                }
            }
        }

    }
    else {
        //If you are a miner, wait for someone to take the energy from you.
        if(creepObj.memory.job !== Constants.CREEP_HARVESTER_MINER){
            if(target === spawn && target.energy === target.energyCapacity){
                creepObj.moveToRoomPosition(target.pos.x+3, target.pos.y, target.room);
            }
            else{
                creepObj.moveToRoomObject(target);
                creepObj.transferEnergy(target);
            }
        }
    }
}
