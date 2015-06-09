var Constants = require('const');

module.exports = function (object, spawn, creepObj, state, claimedRoom) {
    
    if(state !== Constants.STATE_AMASS){
        
        if(creepObj.room !== object.room){
            var exit = creepObj.room.findExitTo(object.room);
            var pointTo = creepObj.pos.findClosest(exit);
            creepObj.moveTo(pointTo);
        }
        else{
            var targets = object.pos.findInRange(FIND_HOSTILE_CREEPS, 15);
            if(targets && targets.length) {
                creepObj.moveTo(targets[0]);
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
                creepObj.moveTo(pos.x, pos.y);
                if(object.pos.findInRange([creepObj], 5).length > 0){
                    return true;
                }
                else{
                    return false;
                }
            }
        }        
    }
    else{
        //GET OUT THE WAY
    	creepObj.moveTo(spawn.pos.x+5, spawn.pos.y);
	    return false;
    }
    
}