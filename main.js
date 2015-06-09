var Colony = require('colony');
var Outpost = require('outpost');
var Constants = require('const');
var Scout = require('scoutCreep');
var expand = true;

/*
for(var creepid in Memory.scouts){
	var creep = Game.creeps[Memory.scouts[creepid]];
	if(creep){
	    Scout(creep);
	}
}
*/
for(var colony in Game.spawns){
    Colony(Game.spawns[colony]);
    if(Game.spawns[colony].memory.state !== Constants.STATE_SPREAD){
        expand = false;
    }
}
for(var outpost in Game.flags){
	if(!Game.flags[outpost].memory.spawn){
		Game.flags[outpost].memory.spawn = "Spawn1";
	}
    Outpost(Game.flags[outpost]);
    if(Game.flags[outpost].memory.state !== Constants.STATE_SPREAD){
        expand = false;
    }
}

var scanRoom = function(room){

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

            //TODO: weigh up the benifits with the evil things?
            if(!spawnKeepers){
                mine = mines[possible];
            }
            break;
        }
    }
    return mine;

}

var nextRoomName = function(room, direction){
	var ew = room[0];
	var ewval = +room[1];

	var ns = room[2];
	var nsval = +room[3];

	if(direction === FIND_EXIT_TOP){
		if(ns === "N"){
			return ew + ewval + ns + (nsval+1);
		}
		else{
			if(nsval === 1){
				return ew + ewval + "N1";
			}
			else{
				return ew + ewval + ns + (nsval-1);
			}
		}
	}
	else if(direction === FIND_EXIT_RIGHT){
		if(ns === "E"){
			return ew + (ewval+1) + ns + nsval;
		}
		else{
			if(nsval === 1){
				return "E1" + ns + nsval;
			}
			else{
				return ew + (ewval-1) + ns + nsval;
			}
		}
	}
	else if(direction === FIND_EXIT_BOTTOM){
		if(ns === "S"){
			return ew + ewval + ns + (nsval+1);
		}
		else{
			if(nsval === 1){
				return ew + ewval + "S1";
			}
			else{
				return ew + ewval + ns + (nsval-1);
			}
		}
	}
	else if(direction === FIND_EXIT_LEFT){
		if(ns === "W"){
			return ew + (ewval+1) + ns + nsval;
		}
		else{
			if(nsval === 1){
				return "W1" + ns + nsval;
			}
			else{
				return ew + (ewval-1) + ns + nsval;
			}
		}
	}
}

function makeScoutCreep(room){
	var spawn = Game.spawns.Spawn1;
	var creep = spawn.createCreep([MOVE, MOVE, MOVE, MOVE, MOVE], undefined, {targetRoom:room});
	if(typeof(creep) === "string"){
		Memory.scouts.push(creep);
	}
}


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
    			mine = scanRoom(room);
            }
        }
        
        if(mine){
            mine.room.createFlag(mine.pos.x, mine.pos.y+4);
        }
        else{
            var nextRooms = [];
            //Expand outside!
            
    		for(var roomId in roomtest){
                var room = Game.rooms[roomtest[roomId]];

                //Clockwise we go!
                var top = room.find(FIND_EXIT_TOP);
                var right = room.find(FIND_EXIT_RIGHT);
                var bottom = room.find(FIND_EXIT_BOTTOM);
                var left = room.find(FIND_EXIT_LEFT);

                var nextRoom;
                if(top){
                	nextRoom = nextRoomName(roomtest[roomId], FIND_EXIT_TOP);
                	if(roomtest.indexOf(nextRoom) < 0){
                		if(Game.rooms[nextRoom]){
                			nextRooms.push(nextRoom);
                		}
                		else{
                			makeScoutCreep(nextRoom);
                		}
                	}
                }
		        if(bottom){
                	nextRoom = nextRoomName(roomtest[roomId], FIND_EXIT_BOTTOM);
                	if(roomtest.indexOf(nextRoom) < 0){
                		if(Game.rooms[nextRoom]){
                			nextRooms.push(nextRoom);
                		}
                		else{
                			makeScoutCreep(nextRoom);
                		}
                	}
		        }
		        if(left){
                	nextRoom = nextRoomName(roomtest[roomId], FIND_EXIT_LEFT);
                	if(roomtest.indexOf(nextRoom) < 0){
                		if(Game.rooms[nextRoom]){
                			nextRooms.push(nextRoom);
                		}
                		else{
                			makeScoutCreep(nextRoom);
                		}
                	}
		        }
		        if(right){
                	nextRoom = nextRoomName(roomtest[roomId], FIND_EXIT_RIGHT);
                	if(roomtest.indexOf(nextRoom) < 0){
                		if(Game.rooms[nextRoom]){
                			nextRooms.push(nextRoom);
                		}
                		else{
                			makeScoutCreep(nextRoom);
                		}
                	}
		        }

            }

            for(var roomid in nextRooms){
                var room = Game.rooms[nextRooms[roomid]];
                if(room.controler){
            		//See if room is held by other player and occupy/invade accordingly
            		if(room.controler.owner.username !== "Galasquin"){
			            //room.createFlag(room.controler.pos.x, room.controler.pos.y);
            		}
                }
                else{
                	var mine = scanRoom(room);
			        if(mine){
			        	var randId;
			        	do{
			        		randId = "Flag"+Math.round(Math.random()*10000);
			        	}
			        	while(Game.flags[randId]);

			            mine.room.createFlag(mine.pos.x, mine.pos.y+4, randId);
			            Game.flags[randId].memory.spawn = "Spawn1";

			        }
                }
            }            
        }
    }
}