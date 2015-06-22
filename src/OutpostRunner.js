var Constants = require('const');
var CreepMaker = require('creepMaker');

module.exports = {
    //Main loop
    outpostLoop:function(roomMemory, memory, count, requestCallback){
        memory.state = Constants.STATE_HARVEST;
        
        //TODO: THIS NEEDS TO BE BETTER DONE TO MAKE SURE THEY ARE EQUALLY SPLIT OVER TIME
        
        //Check count here
        if(roomMemory.level < 2 && count.harvesterCreeps < 1){
            //If low level then make basic one
            requestCallback({
                room:memory.name, 
                outpost:memory.id, 
                target:memory.sources[0]
            }, CREEP_HARVESTER);
        }
        else if(count.harvesterMinerCreeps < 2*memory.sources.length){
            //2 miners per source
            requestCallback({
                room:memory.name, 
                outpost:memory.id, 
                target:memory.sources[memory.creepIncCount % memory.sources.length]
            }, CREEP_HARVESTER_MINER);
            memory.creepIncCount ++;
        }
        else if(count.harvesterCarryCreeps < 2*memory.sources.length){
            //2 carriers per source
            requestCallback({
                room:memory.name, 
                outpost:memory.id
            }, CREEP_HARVESTER_CARRY);
        }
        else{
            memory.state = Constants.STATE_EXPAND;
        }
    },
    
    //Create new memory instance for room
    initOutpostState:function(roomObj, roomName){
        var memory = {
            state:0,
            sources:[],
            creeps:[],
            posX:roomObj.pos.x,
            posY:roomObj.pos.y,
            id:roomObj.name || roomObj.id,
            creepIncCount:0,
            room:roomName
        };
        
        var mines = roomObj.pos.findInRange(FIND_SOURCES, Constants.DISTANCE_MINE);
        for(var mine in mines){
            
            //Test to see if there are keepers nearby
            var struct = mines[mine].pos.findInRange(FIND_HOSTILE_STRUCTURES, 10, {
                filter:function(i){
                    return i.owner.username === "Source Keeper";
                }
            });
            var spawnKeepers = struct.length > 0;
            
            //Add to memory object
            memory.sources.push({
                id:mines[mine].id,
                spawnKeepers:spawnKeepers,
                x:mines[mine].pos.x,
                y:mines[mine].pos.y
            });
        }
        
        return memory;
    },
    
    getDepositTarget:function(memory){
        //TODO: THIS SHOULD BE CALCULATED IN THE LOOP
        /*
        if(!outpostMemory.hasSpawn){
            var extensions = object.pos.findInRange(FIND_MY_STRUCTURES, 15, {
                filter:function(i){
                    return i.structureType === STRUCTURE_EXTENSION && i.energy < i.energyCapacity;
                }
            });
            if(extensions.length === 0){
                target = spawn;
            }
            else{
                target = extensions[0];
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
        */
    }
    
    //Do you want to expand elsewhere?
    isExpandState:function(memory){
        return memory.state === STATE_EXPAND;
    },
    
    getSource:function(memory, id){
        var room = Game.rooms[memory.room];
        var sources = room.find(FIND_SOURCES, {
            filter:function(i){
                return i.id == id;
            }
        });
        return sources[0];
    }
}