var Constants = require('const');
var OutpostRunner = require('OutpostRunner');

module.exports = function (creepObj, memory, room, outpost) {

    var target = outpost.getDepositTarget();

    if(!creepObj.memory.task || creepObj.energy === 0){
        creepObj.memory.task = "collect";
    }
    else if(creepObj.energy === creepObj.energyCapacity){
        creepObj.memory.task = "store";
    }

    if(creepObj.memory.task === "collect") {
        var steal = false;
        if(creepObj.memory.job !== Constants.CREEP_HARVESTER_MINER){
            //If you are a miner, dont steal
            var creepsNear = creepObj.pos.findInRange(FIND_MY_CREEPS, 1, {
                filter:function(i){
                    return i !== creepObj;
                }
            });
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
                var source = outpost.getSource(memory.target.id);
                var closest = source.pos.findInRange(FIND_MY_CREEPS, 2, {
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

                    if(most){
                        creepObj.moveToRoomObject(most);
                        most.transferEnergy(creepObj);
                    }
                    else{
                        creepObj.moveToRoomPosition(target.pos.x, target.pos.y+2, target.room);
                    }
                }
                else{
                    creepObj.moveToRoomPosition(target.pos.x, target.pos.y+2, target.room);
                }

            }
            else{
                //Else harvest if you can.
                var source = outpost.getSource(memory.target.id);

                creepObj.moveToRoomObject(source);
                creepObj.harvest(source);
            }
        }
        else{
            //If you are a miner, wait for someone to take the energy from you.
            if(creepObj.memory.job !== Constants.CREEP_HARVESTER_MINER){
                if(target.energy === target.energyCapacity){
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
            if(target.energy === target.energyCapacity){
                creepObj.moveToRoomPosition(target.pos.x+3, target.pos.y, target.room);
            }
            else{
                creepObj.moveToRoomObject(target);
                creepObj.transferEnergy(target);
            }
        }
    }
}
