module.exports = function (spawn, creepObj) {
    if(creepObj.energy < creepObj.energyCapacity) {
        var sources = spawn.pos.findInRange(FIND_SOURCES, 10);
		creepObj.moveTo(sources[0]);
		creepObj.harvest(sources[0]);
	}
	else {
	    var target = spawn;
	    if(spawn.energy === spawn.energyCapacity){
	        
	        var extensions = spawn.pos.findInRange(FIND_MY_STRUCTURES, 15);
	        for(var struct in extensions){
	            if(extensions[struct].structureType === STRUCTURE_EXTENSION && extensions[struct].energy < extensions[struct].energyCapacity){
	                target = extensions[struct];
	            }
	        }
	    }
		creepObj.moveTo(target);
		creepObj.transferEnergy(target);
    }
}
    