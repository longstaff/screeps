var Defence = require('defenceCreep');
var Harvest = require('harvestCreep');
var Worker = require('workerCreep');
var Offence = require('offenceCreep');
var Constants = require('const');
var StructureMaker = require('structureMaker');
var CreepMaker = require('creepMaker');

module.exports = function (spawn) {

    var currentState = spawn.memory.state;

    if(!spawn.memory.screeps){
        spawn.memory.screeps = [];
    }
    if(!spawn.memory.hasSpawned){
        spawn.memory.hasSpawned = [];
    }
    if(!spawn.memory.buildingSites){
        spawn.memory.buildingSites = [];
    }
    if(!spawn.memory.controlLevel){
        spawn.memory.controlLevel = 0;
    }
    if(!spawn.memory.extensions){
        spawn.memory.extensions = 0;
    }
    if(!spawn.memory.notYet){
        spawn.memory.notYet = [];
    }

    var creeps = spawn.memory.screeps;
    var hasSpawned = spawn.memory.hasSpawned;

    var defenceCreeps = 0;
    var offenceCreeps = 0;
    var workerCreeps = 0;
    var workerMinerCreeps = 0;
    var workerCarryCreeps = 0;
    var harvesterCreeps = 0;
    var harvesterMinerCreeps = 0;
    var harvesterCarryCreeps = 0;

    var buildSites = [];
    var activeSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
    for(var sites in activeSites){
        if(spawn.memory.notYet.indexOf(activeSites[sites].id) < 0){
            buildSites.push(activeSites[sites]);
        }
    }

    for(var creep in creeps) {
        var creepObj = Game.creeps[creeps[creep]];

        if(!CreepMaker.screepIsDead(spawn, creeps[creep], creepObj)){
            switch(creepObj.memory.job){
                case Constants.CREEP_DEFENCE:
                    defenceCreeps ++;
                    break;
                case Constants.CREEP_OFFENCE:
                    offenceCreeps ++;
                    break;
                case Constants.CREEP_WORKER:
                    workerCreeps ++;
                    break;
                case Constants.CREEP_WORKER_MINER:
                    workerMinerCreeps ++;
                    break;
                case Constants.CREEP_WORKER_CARRY:
                    workerCarryCreeps ++;
                    break;
                case Constants.CREEP_HARVESTER:
                    harvesterCreeps ++;
                    break;
                case Constants.CREEP_HARVESTER_MINER:
                    harvesterMinerCreeps ++;
                    break;
                case Constants.CREEP_HARVESTER_CARRY:
                    harvesterCarryCreeps ++;
                    break;
            }
        }
    }

    //Set state
    setState();
    currentState = spawn.memory.state;

    function setState(){
        //TODO: set states
        if(harvesterCreeps + harvesterCarryCreeps + harvesterMinerCreeps < 6){
            spawn.memory.state = Constants.STATE_HARVEST;
        }
        else if(defenceCreeps < 5){
            spawn.memory.state = Constants.STATE_DEFENCE;
        }
        else if(canExpand()){
            spawn.memory.state = Constants.STATE_EXPAND;
        }
        else if(spawn.room.controller && spawn.room.controller.level < 3){
            spawn.memory.state = Constants.STATE_STORE;
        }
        else{
            spawn.memory.state = Constants.STATE_SPREAD;
        }
    }
    function canExpand(){
        if(spawn.memory.extensions <= 10){
            if(StructureMaker.createNewExtension(spawn)){
                spawn.memory.extensions = spawn.memory.extensions +1;
            }
        }

        if(spawn.room.controller.level > 2 && spawn.memory.controlLevel !== spawn.room.controller.level){
            StructureMaker.createRoads(spawn);
        }
        if(spawn.room.controller.level > 2 && spawn.memory.controlLevel !== spawn.room.controller.level){
            StructureMaker.createRoomDefenses(spawn.room);
        }

        if(spawn.memory.controlLevel !== spawn.room.controller.level){
            spawn.memory.controlLevel = spawn.room.controller.level;
            spawn.memory.notYet = [];
        }

        if(buildSites.length > 0){
            return true;
        }
        else{
            return false;
        }
    }

    //Create new creep
    if(currentState === Constants.CREEP_DEFENCE || defenceCreeps + offenceCreeps + workerCreeps + harvesterCreeps <= 18){
        var extensionCount = 0;
        var extensions = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: function(i) {
                return i.structureType === STRUCTURE_EXTENSION;
            }
        });
        if(extensions) extensionCount = extensions.length;

        switch(currentState){
            case Constants.STATE_HARVEST:
                if(extensionCount === 0 && harvesterCreeps < 2){
                    //Generic ones to start you off
                    CreepMaker.makeHarvesterCreep(spawn, spawn, extensionCount);
                }
                else if(harvesterMinerCreeps < 2){
                    //A couple of miners
                    CreepMaker.makeHarvesterMinerCreep(spawn, spawn, extensionCount);
                }
                else{
                    //The rest are carrying energy
                    CreepMaker.makeHarvesterCarryCreep(spawn, spawn, extensionCount);
                }
                break;
            case Constants.STATE_DEFENCE:
                if(defenceCreeps%2 == 0){
                    CreepMaker.makeDefenceRangeCreep(spawn, spawn, extensionCount);
                }
                else{
                    CreepMaker.makeDefenceShortCreep(spawn, spawn, extensionCount);
                }
                break;
            case Constants.STATE_EXPAND:
                if(spawn.room.controller){
                    CreepMaker.makeWorkerCreep(spawn, spawn, extensionCount);
                }
                break;
            case Constants.STATE_SPREAD:
            case Constants.STATE_STORE:
                if(extensionCount === 0 && workerCreeps < 2){
                    //Generic ones to start you off
                    CreepMaker.makeWorkerCreep(spawn, spawn, extensionCount);
                }
                else if(workerMinerCreeps < 2){
                    //A couple of miners
                    CreepMaker.makeWorkerMinerCreep(spawn, spawn, extensionCount);
                }
                else{
                    //The rest are carrying energy
                    CreepMaker.makeWorkerCarryCreep(spawn, spawn, extensionCount);
                }
                break;
        }

    }

    //Tell creeps to do something
    for(var creep in creeps) {
        var creepObj = Game.creeps[creeps[creep]];

        if(!CreepMaker.screepIsDead(spawn, creeps[creep], creepObj)){

            if(creepObj.memory.job === Constants.CREEP_DEFENCE) {
                Defence(spawn, creepObj);
            }
            if(creepObj.memory.job === Constants.CREEP_OFFENCE) {
                Offence(spawn, spawn, creepObj, currentState, true);
            }

            if(creepObj.memory.job === Constants.CREEP_HARVESTER ||
                creepObj.memory.job === Constants.CREEP_HARVESTER_MINER ||
                creepObj.memory.job === Constants.CREEP_HARVESTER_CARRY) {
                Harvest(spawn, spawn, creepObj);
            }

            if(creepObj.memory.job === Constants.CREEP_WORKER ||
                creepObj.memory.job === Constants.CREEP_WORKER_MINER ||
                creepObj.memory.job === Constants.CREEP_WORKER_CARRY) {
                if((currentState === Constants.STATE_DEFENCE || currentState === Constants.STATE_HARVEST) && harvesterCreeps + harvesterCarryCreeps < 2){
                    Harvest(spawn, spawn, creepObj);
                }
                else{
                    Worker(spawn, spawn, creepObj, currentState, buildSites);
                }
            }

        }

    }
}
