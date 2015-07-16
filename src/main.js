var Extend = require('extendScreep');
Extend(Creep.prototype);

var Constants = require('const');
var RoomRunner = require('RoomRunner');
var HarvestScript = require('harvestCreep');
var WorkerScript = require('workerCreep');
var DefenceScript = require('defenceCreep');
var CamperScript = require('camperCreep');

function creepIsDead(name, obj){
    if(!Memory.hasSpawned){
        Memory.hasSpawned = [];
    }

    if(obj === undefined){
        if(Memory.hasSpawned.indexOf(name) >= 0){
            //Has been spawned, so kill this object
            Memory.hasSpawned.splice(Memory.hasSpawned.indexOf(name), 1);
            Memory.creeps[name] = null;
            return true;
        }
        else{
            //Not spawned yet, so just skip this object
            return true;
        }
    }
    else if(obj !== undefined){
        if(Memory.hasSpawned.indexOf(name) < 0){
            Memory.hasSpawned.push(name);
        }
    }

    return false;
}

function countCreeps(){

    var creepCount = {}

    var creeps = Memory.creeps;
    for(var creep in creeps) {
        var creepObj = Game.creeps[creep];
        //Is a valid creep
        if(creepObj && !creepIsDead(creep, creepObj)){

            if(!creepCount[creepObj.memory.room]){
                creepCount[creepObj.memory.room] = {
                    defenceCreeps:0,
                    workerCreeps:0,
                    workerMinerCreeps:0,
                    workerCarryCreeps:0,
                    camperCreeps:{},
                    harvesterCreeps:{},
                    harvesterMinerCreeps:{},
                    harvesterCarryCreeps:{}
                };
            }

            switch(creepObj.memory.job){
                case Constants.CREEP_DEFENCE:
                    creepCount[creepObj.memory.room].defenceCreeps ++;
                    break;
                case Constants.CREEP_WORKER:
                    creepCount[creepObj.memory.room].workerCreeps ++;
                    break;
                case Constants.CREEP_WORKER_MINER:
                    creepCount[creepObj.memory.room].workerMinerCreeps ++;
                    break;
                case Constants.CREEP_WORKER_CARRY:
                    creepCount[creepObj.memory.room].workerCarryCreeps ++;
                    break;

                case Constants.CREEP_CAMPER:
                    if(!creepCount[creepObj.memory.room].camperCreeps[creepObj.memory.outpost]){
                        creepCount[creepObj.memory.room].camperCreeps[creepObj.memory.outpost] = 0;
                    }
                    creepCount[creepObj.memory.room].camperCreeps[creepObj.memory.outpost] ++;
                    break;
                case Constants.CREEP_HARVESTER:
                    if(!creepCount[creepObj.memory.room].harvesterCreeps[creepObj.memory.outpost]){
                        creepCount[creepObj.memory.room].harvesterCreeps[creepObj.memory.outpost] = 0;
                    }
                    creepCount[creepObj.memory.room].harvesterCreeps[creepObj.memory.outpost] ++;
                    break;
                case Constants.CREEP_HARVESTER_MINER:
                    if(!creepCount[creepObj.memory.room].harvesterMinerCreeps[creepObj.memory.outpost]){
                        creepCount[creepObj.memory.room].harvesterMinerCreeps[creepObj.memory.outpost] = 0;
                    }
                    creepCount[creepObj.memory.room].harvesterMinerCreeps[creepObj.memory.outpost] ++;
                    break;
                case Constants.CREEP_HARVESTER_CARRY:
                    if(!creepCount[creepObj.memory.room].harvesterCarryCreeps[creepObj.memory.outpost]){
                        creepCount[creepObj.memory.room].harvesterCarryCreeps[creepObj.memory.outpost] = 0;
                    }
                    creepCount[creepObj.memory.room].harvesterCarryCreeps[creepObj.memory.outpost] ++;
                    break;
            }
        }
    }

    return creepCount;
}


if(!Memory.memoryRooms){
    Memory.memoryRooms = {};
}

//Add extra rooms and init
for(var room in Game.rooms){
    if(!Memory.memoryRooms[Game.rooms[room].name]){
        Memory.memoryRooms[Game.rooms[room].name] = RoomRunner.initRoomState(Game.rooms[room]);
    }
}

var roomObjects = {};
//Loop the rooms
var creepCount = countCreeps();
for(var room in Memory.memoryRooms){
    roomObjects[Memory.memoryRooms[room].name] = new RoomRunner(Memory.memoryRooms[room], creepCount[Memory.memoryRooms[room].name], requestCreep);
}

//Find highest room for construction
var highestRoom;
var levelRoom = 0;
for(var room in roomObjects){
    if(roomObjects[room].isMine() && roomObjects[room].getLevel() > levelRoom ){
        levelRoom = roomObjects[room].getLevel();
        highestRoom = roomObjects[room];
    }
}

//Rooms are either without controllers, or need more level throw requests here
var requestedCreeps = [];
function requestCreep(memoryObject, type){
    requestedCreeps.push({memory:memoryObject, type:type});
}

//Check global states
var expand = true;
var help = false;
for(var room in roomObjects){
    if(!roomObjects[room].isExpandState()){
        expand = false;
    }
    if(!roomObjects[room].isAlarmState()){
        help = roomObjects[room];
    }
}

if(help){
    //Get some defence from rooms and send to alarmed room
}
else{
    //If someone requested a creep, make it for them
    if(requestedCreeps.length){
        for(var creep in requestedCreeps){
            highestRoom.createCreep(requestedCreeps[creep]);
        }
    }

    if(exapand){
        //Check known rooms
        //If valid but occupied, invade
        //If valid but unoccupied, claim if has controller
        //If no unclaimable rooms, expand with scouts
    }
}

//Run invaders
//Run scouts


//Loop over creeps here
var creeps = Memory.creeps;
for(var creep in creeps) {
    var creepObj = Game.creeps[creep];
    if(!creepIsDead(creep, creepObj)){

        switch(creeps[creep].job){
            case Constants.CREEP_HARVESTER:
            case Constants.CREEP_HARVESTER_CARRY:
            case Constants.CREEP_HARVESTER_MINER:

                if(!creeps[creep].room){
                    creepObj.memory.room = creepObj.room.name;
                }
                if(!creeps[creep].outpost){
                    creepObj.memory.outpost = "Flag2";
                }

                var room = roomObjects[creeps[creep].room];
                var outpost = room.getOutpost(creeps[creep].outpost);

                HarvestScript(Game.creeps[creep], creeps[creep], room, outpost);

                break;

            case Constants.CREEP_WORKER:
            case Constants.CREEP_WORKER_CARRY:
            case Constants.CREEP_WORKER_MINER:
                var room = roomObjects[creeps[creep].room];
                WorkerScript(Game.creeps[creep], creeps[creep], room);
                break;

            case Constants.CREEP_DEFENCE:
                var room = roomObjects[creeps[creep].room];
                DefenceScript(Game.creeps[creep], creeps[creep], room);
                break;

            case Constants.CREEP_CAMPER:
                var room = roomObjects[creeps[creep].room];
                var outpost = room.getOutpost(creeps[creep].outpost);
                CamperScript(Game.creeps[creep], creeps[creep], room, outpost);
                break;
        }
    }

}
