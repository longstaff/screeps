var Colony = require('colony');
var Outpost = require('outpost');
var Constants = require('const');
var expand = true;

for(var colony in Game.spawns){
    Colony(Game.spawns[colony]);
    if(Game.spawns[colony].memory.state !== Constants.STATE_SPREAD){
        expand = false;
    }
}
/*
for(var outpost in Game.flags){
    Outpost(Game.flags[outpost]);
    if(Game.flags[outpost].memory.state !== Constants.STATE_SPREAD){
        expand = false;
    }
}
*/


if(expand){
    //Find a good spot
    var roomtest = [];
    
    for(var colony in Game.spawns){
        roomtest.push(Game.spawns[colony].room.name);
    }
    for(var outpost in Game.flags){
        if(roomtest.indexOf(Game.flags[outpost].room.name)){
            roomtest.push(Game.flags[outpost].room.name);
        }
    }
    
    var built = false;
    
    for(var roomId in roomtest){
        console.log(roomtest);
        var curRoom = Game.rooms[roomtest[roomId]];
        var testFlags = curRoom.find(FIND_FLAGS);
        var allowed = true;
        
        for(var flag in testFlags){
            if(!allowed || built){
                break;
            }
            
            var pos = testFlags[flag].pos;
            for(var i = 0; i< 10; i++){
                var test = curRoom.createConstructionSite(pos.x, pos.y+i, STRUCTURE_SPAWN);
                //TODO: Add the memory from the flag somehow
                if(test == OK){
                    built = true;
                    break;
                }
                else if(test == ERR_RCL_NOT_ENOUGH){
                    allowed = false;
                    break;
                }
            }
        }
    }
    
    
    if(!built){
        var mine;
        
        for(var roomId in roomtest){
            if(!mine){
                var room = Game.rooms[roomtest[roomId]];
                var mines = room.find(FIND_SOURCES);
                for(var possible in mines){
                    var pos = mines[possible].pos;
                    if(pos.findInRange(FIND_FLAGS, 10) == 0 && pos.findInRange(FIND_MY_SPAWNS, 10) == 0){
                        
                        var struct = pos.findInRange(FIND_HOSTILE_STRUCTURES, 10);
                        var spawnKeepers = false;
                        for(var structure in struct){
                            if(struct[structure].owner.username === "Source Keeper"){
                                spawnKeepers = true;
                                break;
                            }
                        }
                        if(!spawnKeepers){
                            var creeps = pos.findInRange(FIND_HOSTILE_CREEPS, 10);
                            for(var creep in creeps){
                                if(creeps[creep].owner.username === "Source Keeper"){
                                    spawnKeepers = true;
                                    break;
                                }
                            }
                        }
                        if(!spawnKeepers){
                            mine = mines[possible];
                        }
                        //TODO: weigh up the benifits with the evil things?
                        break;
                    }
                }
            }
        }
        
        if(mine){
            mine.room.createFlag(mine.pos.x, mine.pos.y+4);
        }
        else{
            var nextRooms = [];
            //Expand outside!
            
            //See if room is held by other player and occupy/invade accordingly
        }
    }
    
    //createFlag(pos, [name], [color])
}

//Create new flag
//var flag = room.createFlag();
//This should be dynamic and the closest to the edge of the room
//flag.memory.spawn = "Spawn1";

/*
var clearAll = Game.spawns.Spawn1.room.find(FIND_CONSTRUCTION_SITES);
for(var clear in clearAll){
    if(clearAll[clear].structureType === STRUCTURE_ROAD){
        clearAll[clear].remove();
    }
}
*/
