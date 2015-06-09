module.exports = function (spawn, creepObj) {
    
    if(creepObj.room !== spawn.room){
        var exit = creepObj.room.findExitTo(spawn.room);
        var pointTo = creepObj.pos.findClosest(exit);
        creepObj.moveTo(pointTo);
    }
    else{
    	var targets = spawn.pos.findInRange(FIND_HOSTILE_CREEPS, 15);
		if(targets && targets.length) {
			creepObj.moveTo(targets[0]);
	        if(creepObj.getActiveBodyparts(RANGED_ATTACK) > 0){
			    creepObj.rangedAttack(targets[0]);
	        }
	        if(creepObj.getActiveBodyparts(ATTACK) > 0){
			    creepObj.attack(targets[0]);
	        }
		}
		else{
		    var pos = spawn.pos;
			creepObj.moveTo(pos.x, pos.y + 5);
	    }
    }
    
}