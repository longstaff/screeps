var Constants = require('const');
var RoomRunner = require('RoomRunner');

var WorkerScript = require('Worker');
var HarvestScript = require('Harvester');

function creepIsDead(name, obj){
    if(obj === undefined){
        if(Memory.hasSpawned.indexOf(name) >= 0){
            //Has been spawned, so kill this object
            Memory.hasSpawned.splice(Memory.hasSpawned.indexOf(name), 1);
            Memory.creeps.splice(Memory.creeps.indexOf(name), 1);
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
        var creepObj = Game.creeps[creeps[creep].name];
        //Is a valid creep
        if(creepObj && !creepIsDead(creeps[creep], creepObj)){

            if(!creepCount[creepObj.memory.room]){
                creepCount[creepObj.memory.room] = {
                    defenceCreeps:0,
                    workerCreeps:0,
                    workerMinerCreeps:0,
                    workerCarryCreeps:0,
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

module.exports = function () {
    if(!Memory.memoryRooms){
        Memory.memoryRooms = [];
    }

    //Add extra rooms and init
    for(var room in Game.rooms){
        if(!Memory.memoryRooms[Game.rooms[room].name]){
            Memory.memoryRooms[Game.rooms[room].name] = RoomRunner.initRoomState(Game.rooms[room]);
        }
    }
    
    //Find highest room for construction
    var highestRoom;
    var levelRoom = 0;
    for(var room in Memory.memoryRooms){
        if(RoomRunner.isMine(Memory.memoryRooms[room]) && RoomRunner.getLevel(Memory.memoryRooms[room]) > levelRoom ){
            levelRoom = RoomRunner.getLevel(Memory.memoryRooms[room]);
            highestRoom = Memory.memoryRooms[room];
        }
    }
    
    //Rooms are either without controllers, or need more level throw requests here
    var requestedCreeps = [];
    function requestCreep(memoryObject, type){
        requestedCreeps.push({memory:memoryObject, type:type});
    }
    
    //Loop the rooms
    var creepCount = countCreeps();
    for(var room in Memory.memoryRooms){
        RunRoom.roomLoop(Memory.memoryRooms[room], creepCount[Memory.memoryRooms[room].name], requestCreep);
    }

    //Check global states
    var expand = true;
    var help = false;
    for(var room in Memory.memoryRooms){
        if(!RoomRunner.isExpandState(Memory.memoryRooms[room])){
            expand = false;
        }
        if(!RoomRunner.isAlarmState(Memory.memoryRooms[room])){
            help = Memory.memoryRooms[room];
            break;
        }
    }
    
    //If there is no alarm, otherwise needed for defence.
    if(!help){
        //If someone requested a creep, make it for them
        if(requestedCreeps.length){
            for(var creep in requestedCreeps){
                RoomRunner.createCreep(highestRoom, requestedCreeps[creep]);
            }
        }
    }
    
    if(help){
        //Get some defence from rooms and send to alarmed room
    }
    else if(exapand){
        //Check known rooms
    
        //If valid but occupied, invade

        //If valid but unoccupied, claim if has controller
    
        //If no unclaimable rooms, expand with scouts
    }

    //Run invaders

    //Run scouts
    
    //Loop over creeps here
    
    var creeps = Memory.creeps;
    for(var creep in creeps) {
        switch(creeps[creep].job){
            case Constants.CREEP_HARVESTER:
            case Constants.CREEP_HARVESTER_CARRY:
            case Constants.CREEP_HARVESTER_MINER:
                var creepRoom;
                for(var room in Memory.memoryRooms){
                    if(Memory.memoryRooms[room].name === creeps[creep].room){
                        room = Memory.memoryRooms[room];
                        break;
                    }
                }
                var outpost = RoomRunner.getOutpost(room, creeps[creep].outpost);
                HarvestScript(Game.creeps[creeps[creep].name], creeps[creep], outpost);
                break;
            case Constants.CREEP_WORKER:
            case Constants.CREEP_WORKER_CARRY:
            case Constants.CREEP_WORKER_MINER:
                var creepRoom;
                for(var room in Memory.memoryRooms){
                    if(Memory.memoryRooms[room].name === creeps[creep].room){
                        room = Memory.memoryRooms[room];
                        break;
                    }
                }
                WorkerScript(Game.creeps[creeps[creep].name], creeps[creep], creepRoom);
                break;
        }
    }
}