var Constants = require('const');

module.exports = function (object, spawn, creepObj, state, claimedRoom) {

    if(state !== Constants.STATE_AMASS){

        var targets = object.pos.findInRange(FIND_HOSTILE_CREEPS, 15);
        if(targets && targets.length) {
            creepObj.moveToRoomObject(targets[0]);
            if(creepObj.getActiveBodyparts(RANGED_ATTACK) > 0){
                creepObj.rangedAttack(targets[0]);
            }
            if(creepObj.getActiveBodyparts(ATTACK) > 0){
                creepObj.attack(targets[0]);
            }
            return false;
        }
        else{
            var pos = object.pos;
            creepObj.moveToRoomPosition(pos.x, pos.y + 3, object.room);
            if(object.pos.findInRange([creepObj], 5).length > 0){
                return true;
            }
            else{
                return false;
            }
        }

    }
    else{
        //GET OUT THE WAY
        creepObj.moveToRoomPosition(spawn.pos.x, spawn.pos.y + 5, spawn.room);
        return false;
    }

}
