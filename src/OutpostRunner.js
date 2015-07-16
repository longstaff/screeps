var Constants = require('const');
var CreepMaker = require('creepMaker');

function Outpost(room, memory, count, requestCallback){
    this._room = room;
    this._memory = memory;
    this._count = count;
    this._requestCallback = requestCallback;

    this.loop();
}

Outpost.prototype.loop = function(){
    this._memory.state = Constants.STATE_HARVEST;

    var spawnKeepers = 0;
    for(var i=0; i<this._memory.sources.length; i++){
        if(this._memory.sources[i].spawnKeepers){
            spawnKeepers ++;
            break;
        }
    }

    if(spawnKeepers > this._count.camperCreeps){
        this._requestCallback({
            room:this._memory.room,
            outpost:this._memory.id,
            target:this._memory.sources[i].id
        }, Constants.CREEP_CAMPER);
    }
    //TODO: THIS NEEDS TO BE BETTER DONE TO MAKE SURE THEY ARE EQUALLY SPLIT OVER TIME
    //Check count here
    else if((this._room.level < 2 && this._count.harvesterCreeps < 1) || (this._count.harvesterCreeps === 0 && this._count.harvesterMinerCreeps === 0)){
        //If low level then make basic one
        this._requestCallback({
            room:this._memory.room,
            outpost:this._memory.id,
            target:this._memory.sources[0]
        }, Constants.CREEP_HARVESTER);
    }
    else if(this._count.harvesterMinerCreeps < 2*this._memory.sources.length){
        //2 miners per source
        this._requestCallback({
            room:this._memory.room,
            outpost:this._memory.id,
            target:this._memory.sources[this._memory.creepIncCount % this._memory.sources.length]
        }, Constants.CREEP_HARVESTER_MINER);
        this._memory.creepIncCount ++;
    }
    else if(this._count.harvesterCarryCreeps < 2*this._memory.sources.length){
        //2 carriers per source
        this._requestCallback({
            room:this._memory.room,
            outpost:this._memory.id,
            target:this._memory.sources[this._memory.creepIncCount % this._memory.sources.length]
        }, Constants.CREEP_HARVESTER_CARRY);
    }
    else{
        this._memory.state = Constants.STATE_EXPAND;
    }
}

Outpost.prototype.getDepositTarget = function(){
    if(!this.depositTarget){
        this.depositTarget = this.generateTarget();
    }

    return this.depositTarget;
}
Outpost.prototype.generateTarget = function(){
    var spawn = this._room.getSpawn();
    var target;

    if(!spawn){
        var extensions = this._room.getAvailableExtensions();
        if(extensions.length === 0){
            //Get next rooms spawn;
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

    return target;
}

//Do you want to expand elsewhere?
Outpost.prototype.isExpandState = function(){
    return this._memory.state === Constants.STATE_EXPAND;
}

Outpost.prototype.getSource = function(id){
    //Should cache here?
    var room = this._room.getRoomObj();
    var sources = room.find(FIND_SOURCES, {
        filter:function(i){
            return i.id == id;
        }
    });

    return sources[0];
}

//Create new memory instance for room
Outpost.initOutpostState = function(roomObj, roomName){
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
}

module.exports = Outpost;
