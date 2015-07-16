    var Constants = require('const');
    var OutpostRunner = require('OutpostRunner');
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
                        from:exitList[exit][prop]
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

    function Room(memory, count, requestCallback){
        this._memory = memory;
        this._count = count;
        this._requestCallback = requestCallback;

        this._outposts = {};

        this.loop();
    }

    Room.initRoomState = function(roomObj){
        var memory = {
            state:0,
            controller:!!roomObj.controller,
            level:0,
            mines:[],
            name:roomObj.name,
            outposts:[],
            creeps:[],
            exits:[]
        };

        //Set the current level value to identify if it has a controller etc
        // 0: unclaimed
        if(roomObj.controller){
            memory.level = roomObj.controller.level;
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
        var newSpawns = roomObj.find(FIND_MY_SPAWNS);
        for(var spawn in newSpawns){
            var pos = newSpawns[spawn].pos;
            if(!pos.findInRange(FIND_FLAGS, 10).length){
                roomObj.createFlag(pos);
            }
        }

        var flags = roomObj.find(FIND_FLAGS);
        for(var flag in flags){
            memory.outposts.push(OutpostRunner.initOutpostState(flags[flag]));
        }

        return memory;
    }


        //Main loop
    Room.prototype.loop = function(){

        var roomObj = getRoomObject(this._memory.name);

        var flags = roomObj.find(FIND_FLAGS);
        for(var flag in flags){
            var found = false;
            for(var i=0; i<this._memory.outposts.length; i++){
                if(this._memory.outposts[i].id === flags[flag].name){
                    found = true;
                }
            }
            if(!found){
                this._memory.outposts.push(OutpostRunner.initOutpostState(flags[flag]));
            }
        }
        var requestedCreeps = [];
        function requestCreep(memoryObject, type){
            requestedCreeps.push({memory:memoryObject, type:type});
        }

        if(this._memory.outposts.length){
            for(var outpost in this._memory.outposts){

                var outpostCount = {
                    harvesterCreeps: 0,
                    harvesterMinerCreeps: 0,
                    harvesterCarryCreeps: 0,
                    camperCreeps: 0
                }

                if(this._count && this._count.harvesterCreeps && this._count.harvesterCreeps[this._memory.outposts[outpost].id]){
                    outpostCount.harvesterCreeps = this._count.harvesterCreeps[this._memory.outposts[outpost].id];
                }
                if(this._count && this._count.harvesterMinerCreeps && this._count.harvesterMinerCreeps[this._memory.outposts[outpost].id]){
                    outpostCount.harvesterMinerCreeps = this._count.harvesterMinerCreeps[this._memory.outposts[outpost].id];
                }
                if(this._count && this._count.harvesterCarryCreeps && this._count.harvesterCarryCreeps[this._memory.outposts[outpost].id]){
                    outpostCount.harvesterCarryCreeps = this._count.harvesterCarryCreeps[this._memory.outposts[outpost].id];
                }
                if(this._count && this._count.camperCreeps && this._count.camperCreeps[this._memory.outposts[outpost].id]){
                    outpostCount.camperCreeps = this._count.camperCreeps[this._memory.outposts[outpost].id];
                }

                this._outposts[this._memory.outposts[outpost].id] = new OutpostRunner(this, this._memory.outposts[outpost], outpostCount, requestCreep);
            }
        }

        var roomCount = {
            workerCreeps:0,
            workerMinerCreeps:0,
            workerCarryCreeps:0,
            defenceCreeps:0,
            camperCreeps:0
        }
        if(this._count && this._count.workerCreeps){
            roomCount.workerCreeps = this._count.workerCreeps;
        }
        if(this._count && this._count.workerMinerCreeps){
            roomCount.workerMinerCreeps = this._count.workerMinerCreeps;
        }
        if(this._count && this._count.workerCarryCreeps){
            roomCount.workerCarryCreeps = this._count.workerCarryCreeps;
        }
        if(this._count && this._count.defenceCreeps){
            roomCount.defenceCreeps = this._count.defenceCreeps;
        }

        //Serve outposts first
        if(!requestedCreeps.length){
            //Add workers to queue
            if(this._memory.controller && requestedCreeps.length === 0){
                //Add workers after harvesters in queue.
                if(this._memory.level < 2 && roomCount.workerCreeps < 2){
                    requestedCreeps.push({memory:{room:this._memory.name}, type:Constants.CREEP_WORKER});
                }
                else if(roomCount.workerMinerCreeps < 3){
                    requestedCreeps.push({memory:{room:this._memory.name}, type:Constants.CREEP_WORKER_MINER});
                }
                else if(roomCount.workerCarryCreeps < 3){
                    requestedCreeps.push({memory:{room:this._memory.name}, type:Constants.CREEP_WORKER_CARRY});
                }
                else if(roomCount.defenceCreeps < this._outposts.length * 5){
                    requestedCreeps.push({memory:{room:this._memory.name}, type:Constants.CREEP_DEFENCE});
                }
            }
        }

        if(requestedCreeps.length){
            for(request in requestedCreeps){
                this.createCreep(requestedCreeps[request]);
            }
        }

        //Set your state;
        this._memory.state = Constants.STATE_HARVEST;
        //Expand if you can
        var expand = true;

        if(roomObj.controller && this._memory.level !== roomObj.controller.level){
            if(roomObj.controller.level > 2){
                //Make Roads
                StructureMaker.buildRoads(this._memory.outposts, roomObj);
                //Make extensions
                //StructureMaker.buildExtensions(roomObj.controller.level, this._outposts, roomObj);
            }
            if(roomObj.controller.level > 3){
                //Make Walls
            }
            this._memory.level = roomObj.controller.level;
        }

        for(var outpost in this._outposts){
            if(!this._outposts[outpost].isExpandState()){
                expand = false;
            }
        }
        if(expand){
            if(!this.createNewOutpost()){
                this._memory.state = Constants.STATE_EXPAND;
            }
        }

    }

    Room.prototype.getLevel = function () {
        return this._memory.level;
    }
    Room.prototype.isMine = function () {
        return this._memory.level > 0 && !this._memory.enemy;
    }

    Room.prototype.getOutpost = function (id){
        return this._outposts[id];
    }

    //States for global object to read
    //Do you need help with defence?
    Room.prototype.isAlarmState = function(){
        return this._memory.state === Constants.STATE_ALARM;
    },
    //Do you want to expand elsewhere?
    Room.prototype.isExpandState = function(){
        return this._memory.state === Constants.STATE_EXPAND;
    }

    Room.prototype.createCreep = function(creepObj){
        //My needs come first!
        //if(this._memory.state !== Constants.STATE_HARVEST){
            var roomObj = getRoomObject(this._memory.name);
            var spawns = roomObj.find(FIND_MY_SPAWNS);
            if(spawns.length){
                for(var spawn in spawns){
                    if(CreepMaker.makeCreep(spawns[spawn], creepObj, this._memory.level) === OK){
                        break;
                    }
                }
            }
            else{
                this._requestCallback(creepObj.memory, creepObj.type);
            }

        //}
    }

    Room.prototype.getSpawn = function(){
        var roomObj = getRoomObject(this._memory.name);
        var spawns = roomObj.find(FIND_MY_SPAWNS);
        return spawns[0];
    }

    Room.prototype.getRoomObj = function(){
        return getRoomObject(this._memory.name);
    }

    Room.prototype.getState = function(){
        return this._memory.state;
    }

    Room.prototype.createNewOutpost = function(){
        var roomObj = getRoomObject(this._memory.name);

        var mines = roomObj.find(FIND_SOURCES);
        for(var possible in mines){
            var pos = mines[possible].pos;
            if(pos.findInRange(FIND_FLAGS, Constants.DISTANCE_MINE).length == 0){

                var struct = pos.findInRange(FIND_HOSTILE_STRUCTURES, Constants.DISTANCE_MINE);
                var spawnKeepers = false;
                for(var structure in struct){
                    if(struct[structure].owner.username === "Source Keeper"){
                        spawnKeepers = true;
                        break;
                    }
                }

                //If levelled enough, kill the keepers!
                if(this._memory.level > 3 || !spawnKeepers){
                //if(!spawnKeepers){
                    var flagId = "Flag"+Date.now();
                    var created = roomObj.createFlag(mines[possible].pos.x, mines[possible].pos.y+4, flagId);
                    if(created === OK){
                        this._memory.outposts.push(OutpostRunner.initOutpostState(Game.flags[flagId]));
                    }
                    return true;
                }
                break;
            }
        }

        return false;
    }

    Room.prototype.getBuildSites = function(){
        if(!this._buildsites){
            var roomObj = getRoomObject(this._memory.name);
            this._buildsites = roomObj.find(FIND_CONSTRUCTION_SITES);
        }

        return this._buildsites;
    }

    Room.prototype.getRepairTarget = function(){
        if(!this._repairSites){
            var roomObj = getRoomObject(this._memory.name);

            var targets = [];
            var ramparts = roomObj.find(FIND_MY_STRUCTURES, {
                filter: function(i) {
                    return i.structureType === STRUCTURE_RAMPART;
                }
            });
            for(var rampart in ramparts){
                if(ramparts[rampart].hits < ramparts[rampart].hitsMax/2){
                    targets.push(ramparts[rampart]);
                }
            }
            var staticObjs = roomObj.find(FIND_STRUCTURES, {
                filter: function(i) {
                    return i.structureType === STRUCTURE_ROAD || i.structureType === STRUCTURE_WALL;
                }
            });
            for(var staticObj in staticObjs){
                if(staticObjs[staticObj].hits < staticObjs[staticObj].hitsMax/2){
                    targets.push(staticObjs[staticObj]);
                }
            }

            for(var target in targets){
                this._repairSites = targets[target];
                break;
            }
        }

        return this._repairSites;
    }

    Room.prototype.getHostileCreeps = function(){
        if(!this._hostiles){
            var roomObj = getRoomObject(this._memory.name);

            this._hostiles = roomObj.find(FIND_HOSTILE_CREEPS, {
                filter: function(i) {
                    return i.owner.username !== "Source Keeper";
                }
            });
        }

        return this._hostiles;
    }

    module.exports = Room;
