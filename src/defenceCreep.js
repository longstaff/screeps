module.exports = function (spawn, creepObj) {

	var ramparts = spawn.room.find(FIND_MY_STRUCTURES, {
        filter: function(i) {
            return i.structureType === STRUCTURE_RAMPART;
        }
    });
    var borders = [];
    /*
    for(var rampart in ramparts){
        if(!ramparts[rampart].pos.isNearTo(spawn)){
            borders.push(ramparts[rampart]);
        }
    }
    */

    if(borders.length){
    	var targets = spawn.room.find(FIND_HOSTILE_CREEPS, {
	        filter: function(i) {
	            return i.owner.username !== "Source Keeper";
	        }
	    });

		if(targets && targets.length) {
	        if(creepObj.getActiveBodyparts(RANGED_ATTACK) > 0){

				var closest = targets[0].pos.findClosest(FIND_MY_STRUCTURES, {
			        filter: function(i) {
			            return i.structureType === STRUCTURE_RAMPART;
			        }
			    })
				creepObj.moveTo(closest);
			    creepObj.rangedAttack(targets[0]);
	        }
	        if(creepObj.getActiveBodyparts(ATTACK) > 0){
				creepObj.moveTo(targets[0]);
			    creepObj.attack(targets[0]);
	        }
		}
		else{
			creepObj.moveTo(borders[Math.floor(Math.random()*borders.length)]);
		}
    }
    else{
        var targets = spawn.room.find(FIND_HOSTILE_CREEPS, {
	        filter: function(i) {
	            return i.owner.username !== "Source Keeper";
	        }
	    });
	    
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
			if(!creepObj.moveToTargetPosition("base")){
				creepObj.setTargetPosition("base", pos.x, pos.y + 5, spawn.room.name);
			}
		}
    }

}
