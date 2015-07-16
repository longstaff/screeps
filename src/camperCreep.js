module.exports = function (creepObj, memory, room, outpost) {


    var source = outpost.getSource(memory.target);
    if(source){
        var targets = source.pos.findInRange(FIND_HOSTILE_CREEPS, 10);

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
            if(!creepObj.moveToTargetPosition("base")){
                var place = source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 10, {
                    filter:function(i){
                        return i.structureType === STRUCTURE_KEEPER_LAIR;
                    }
                });
                if(place && place.length){
                    var pos = place[0].pos;
                    creepObj.setTargetPosition("base", pos.x, pos.y, source.room.name);
                }
                else{
                    creepObj.moveTo(source);
                }
            }
        }
    }

}
