module.exports = function (object, spawn, creepObj) {
    if(creepObj.energy < creepObj.energyCapacity) {
        var sources = object.pos.findInRange(FIND_SOURCES, 10);

        if(creepObj.room !== sources[0].room){
            var exit = creepObj.room.findExitTo(sources[0].room);
            var pointTo = creepObj.pos.findClosest(exit);
            creepObj.moveTo(pointTo);
        }
        else{
            creepObj.moveTo(sources[0]);
            creepObj.harvest(sources[0]);
        }
    }
    else {
        var target = object;
        //Test if a spawn or a flag
        if(!object.energyCapacity){ 
            var extensions = object.pos.findInRange(FIND_MY_STRUCTURES, 15);
            if(extensions.length === 0){
                target = spawn;
            }
            else{
                for(var struct in extensions){
                    if(extensions[struct].structureType === STRUCTURE_EXTENSION && extensions[struct].energy < extensions[struct].energyCapacity){
                        target = extensions[struct];
                        break;
                    }
                }
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

        if(creepObj.room !== target.room){
            var exit = creepObj.room.findExitTo(target.room);
            var pointTo = creepObj.pos.findClosest(exit);
            creepObj.moveTo(pointTo);
        }
        else{
            creepObj.moveTo(target);
            creepObj.transferEnergy(target);
        }
    }
}
    