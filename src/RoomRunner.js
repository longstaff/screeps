var Constants = require('const');
var OutpostRunner = require('OupostRunner');
var StructureMaker = require('structureMaker');
var CreepMaker = require('creepMaker');

function getRoomObject(name){
    return Game.rooms[name];
}

function iterateRoomExits(exitList, prop){
    if(exitList.length){
        var returnList = [];
        var exitObj;
        var exitPos = -1;
        for(var exit in exitList){
            if(exitPos+1 !== exitList[exit][prop]){
                if(exitObj){
                    exitObj.to = exitPos;
                    returnList.push(exitObj);
                }
                exitObj = {
                    from:exitList[exit][prop];
                }
            }
            exitPos = exitList[exit][prop];
        }
        exitObj.to = exitPos;
        returnList.push(exitObj);
        
        return returnList;
    }
    else return [];
}

module.exports = {
    //Main loop
    roomLoop:function(memory, count, requestCallback){
        
        //If we have outposts set up, loop over and run.
        if(memory.outposts.length){
            
            var roomObj = getRoomObject(memory.name);
        
            //Check count here
            if(count.defenceCreeps < (4 * memory.outposts.length)){
                //Throw out to get most advanced possible.
                requestCallback({room:memory.name}, Constants.CREEP_DEFENCE);
            }
            
            //Creeps to be making locally.
            requestedCreeps = [];
            function requestCreep(memoryObject, type){
        		requestedCreeps.push({memory:memoryObject, type:type});
        	}
        	//Loop the rooms
        	for(var outpost in memory.outposts){
        	    var outpostCount = {
        	        harvesterCreeps: count.harvesterCreeps[memory.outposts[outpost].id],
        	        harvesterMinerCreeps: count.harvesterMinerCreeps[memory.outposts[outpost].id],
        	        harvesterCarryCreeps: count.harvesterCarryCreeps[memory.outposts[outpost].id]
        	    }
        		OutpostRunner.outpostLoop(memory, memory.outposts[outpost], outpostCount, requestCreep);
        	}
            
            //Only make workers if there is a controller
            if(memory.controller){
                //Add workers after harvesters in queue.
                if(memory.level < 2 && count.workerCreeps < 2){
                    requestedCreeps.push({memory:{room:memory.name}, type:Constants.CREEP_WORKER});
                }
                else if(count.workerMinerCreeps < 3){
                    requestedCreeps.push({memory:{room:memory.name}, type:Constants.CREEP_WORKER_MINER});
                }
                else if(count.workerCarryCreeps < 3){
                    requestedCreeps.push({memory:{room:memory.name}, type:Constants.CREEP_WORKER_CARRY});
                }
            }
            
            //Find spawn and create
            var spawned = false;
            if(requestedCreeps.length){
                if(roomObj && memory.controller && memory.level > 1){
                    var spawns = roomObj.find(FIND_MY_SPAWNS);
                    if(spawns.length){
                        spawned = true;
                        
                        //Loop over and create
                        for(var creepObj in requestedCreeps){
                            for(var spawn in spawns){
                                if(CreepMaker.makeCreep(spawns[spawn], creepObj, memory.level) === OK){
                                    //TODO: Add to the creep room count here
                                    break;
                                }
                            }
                        }
                        
                    }
                }
            }
            //If you dont have a spawn, then throw these to top controller
            if(!spawned){
                for(var creepObj in requestedCreeps){
                    requestCallback(creepObj.memory, creepObj.type);
                }
            }
            
            //Set your state;
            memory.state = Constants.STATE_HARVEST;
            
            if(roomObj){
                var enemyCreeps = roomObj.find(FIND_HOSTILE_CREEPS, {
                    filter:function(i){
                        return i.owner.username !== "Source Keeper";
                    }
                });
                
                if(enemyCreeps.length){
                    memory.state = Constants.STATE_ALARM;
                }
            }
            
            //Expand if you can
            var expand = memory.state !== Constants.STATE_ALARM;
            var couldExpand = false;
        	for(var outpost in memory.outposts){
        		if(!OutpostRunner.isExpandState(memory.outposts[outpost])){
        			expand = false;
        		}
        	}
            
            //Build
            if(roomObj && roomObj.controller && roomObj.controller.my){
                if(roomObj.controller.level !== memory.level){
                    memory.level = roomObj.controller.level;
                    //Try to build things again
                    memory.notYet = [];

                    if(memory.level > 1){
                        StructureMaker.buildExtensions(memory.level, memory.outposts, roomObj);
                        StructureMaker.buildLocalRamparts(memory.outposts, roomObj);
                    }
                    if(memory.level > 2){
                        StructureMaker.buildRoads(memory.outposts, roomObj);
                    }
                    if(memory.level > 3){
                        StructureMaker.buildWalls(memory.exits, roomObj);
                    }
                    
                    //Energy Links lvl 5+
                    
                    //More than 1 spawn lvl 7+
                }
                
                var build = roomObj.find(FIND_CONSTRUCTION_SITES, {
                    filter:function(i){
                        return memory.notYet.indexOf(i.id) < 0;
                    }
                });
                
                if(build.length){
                    expand = false;
                }
                memory.buildsites = build;
            }
            else{
                memory.buildsites = [];
            }
            
        	//Try and expand, otherwise throw out the message to parent that we are ready
        	if(expand){
        	    if(!createNewOutpost(memory)){
        	        memory.state = Constants.STATE_EXPAND;
        	    }
        	}
            
        }
    },
    
    //Get the build sites for this tick
    getNextBuildSite:function(memory){
        var roomObj = getRoomObject(memory.name);
        var sites = roomObj.find(FIND_CONSTRUCTION_SITES, {
            filter:function(i){
                return i.id === memory.buildsites[0];
            }
        });
        return sites[0] || null;
    },
    addInvalidBuildSite:function(memory, buildsite){
        memory.notYet.push(buildsite.id);
    },
    
    createNewOutpost:function(memory){
        var roomObj = getRoomObject(memory.name);
        
        var mines = room.find(FIND_SOURCES);
        for(var possible in mines){
            var pos = mines[possible].pos;
            if(pos.findInRange(FIND_FLAGS, DISTANCE_MINE) == 0 && pos.findInRange(FIND_MY_SPAWNS, DISTANCE_MINE) == 0){
    
                var struct = pos.findInRange(FIND_HOSTILE_STRUCTURES, DISTANCE_MINE);
                var spawnKeepers = false;
                for(var structure in struct){
                    if(struct[structure].owner.username === "Source Keeper"){
                        spawnKeepers = true;
                        break;
                    }
                }
                
                //If levelled enough, kill the keepers!
                if(memory.level > 3 || !spawnKeepers){
                    var flagId = "Flag"+Date.now();
                    var created = roomObj.createFlag(mines[possible].pos.x, mines[possible].pos.y+4, flagId);
                    if(created === OK){
                        memory.outposts.push(OutpostRunner.initOutpostState(Game.flags[flagId]));
                    }
                    return true;
                }
                break;
            }
        }
        
        return false;
    },
    
    //Create new memory instance for room
    initRoomState:function(roomObj){
        var memory = {
            state:0,
            controller:!!roomObj.controller,
            enemy:false,
            level:0,
            mines:[],
            exits:[],
            name:roomObj.name,
            outposts:[],
            creeps:[],
            buildsites:[],
            notYet:[]
        };
        
        //Set the current level value to identify if it has a controller etc
        // 0: unclaimed
        if(roomObj.controller){
            memory.level = roomObj.controller.level;
            if(!roomObj.controller.my){
                enemy = true;
            }
        }
        else{
            var enemyCreeps = roomObj.find(FIND_HOSTILE_CREEPS, {
                filter:function(i){
                    return i.owner.username !== "Source Keeper";
                }
            });
            if(enemyCreeps.length){
                enemy = true;
            }
        }
        
        var mines = roomObj.find(FIND_SOURCES);
        for(var mine in mines){
            
            //Test to see if there are keepers nearby
            var struct = mines[mine].pos.findInRange(FIND_HOSTILE_STRUCTURES, 10, {
                filter:function(i){
                    return i.owner.username === "Source Keeper";
                }
            });
            var spawnKeepers = struct.length > 0;
            
            //Add to memory object
            memory.mines.push({
                id:mines[mine].id, 
                spawnKeepers:spawnKeepers, 
                x:mines[mine].pos.x, 
                y:mines[mine].pos.y, 
                claimed:false
            });
        }
        
        memory.exits["top"] = iterateRoomExits(roomObj.find(FIND_EXIT_TOP), "x");
        memory.exits["bottom"] = iterateRoomExits(roomObj.find(FIND_EXIT_BOTTOM), "x");
        memory.exits["left"] = iterateRoomExits(roomObj.find(FIND_EXIT_LEFT), "y");
        memory.exits["right"] = iterateRoomExits(roomObj.find(FIND_EXIT_RIGHT), "y");
        
        //For starting and backwards compatability
        var flags = roomObj.find(FIND_FLAGS).concat(roomObj.find(FIND_MY_SPAWNS));
        if(points.length){
            for(var flag in flags){
                memory.outposts.push(OutpostRunner.initOutpostState(flags[flag]));
            }
        }
        
        return memory;
    },
    getLevel:function (roomMemoryObj) {
        return roomMemoryObj.level;
    },
    isMine:function (roomMemoryObj) {
        return roomMemoryObj.level > 0 && !roomMemoryObj.enemy;
    },
    
    getOutpost:function (roomMemoryObj, id){
        for(var outpost in roomMemoryObj.outposts){
            if(roomMemoryObj.outposts[outpost].id === id){
                return roomMemoryObj.outposts[outpost];
            }
        }
        else return null;
    },
    
    //States for global object to read
    //Do you need help with defence?
    isAlarmState:function(memory){
        return memory.state === STATE_ALARM;
    },
    //Do you want to expand elsewhere?
    isExpandState:function(memory){
        return memory.state === STATE_EXPAND;
    }
    
    createCreep(memory, creepObj){
        //My needs come first!
        if(memory.state !== Constants.STATE_HARVEST){
            var roomObj = getRoomObject(memory.name);
            var spawns = roomObj.find(FIND_MY_SPAWNS);
            for(var spawn in spawns){
                if(CreepMaker.makeCreep(spawns[spawn], creepObj, memory.level) === OK){
                    //TODO: Add to the creep room count here
                    break;
                }
            }
        }
    }
}