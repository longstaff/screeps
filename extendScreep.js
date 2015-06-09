module.exports = function (screepPrototype) {

    screepPrototype.moveToRoomObject = function(object){

        var calculateToPoint = function(creep, target){
            var exit = creep.room.findExitTo(target.room);
            var pointTo = creep.pos.findClosest(exit);

            return {
                x:pointTo.x,
                y:pointTo.y
            };
        };

        if(object.room.name !== this.room.name){
            if(this.memory.moveLockId && (this.memory.moveLockId === object.name || this.memory.moveLockId === object.id)){
                if(this.memory.moveLockRoom && this.memory.moveLockRoom === this.room.name && this.memory.moveLockWaypoint){
                    //No need to recalculate, just move
                    console.log("Saving calculations!");
                }
                else{
                    this.memory.moveLockRoom = this.room.name;
                    this.memory.moveLockWaypoint = calculateToPoint(this, object);
                }
            }
            else{
                if(object.name) this.memory.moveLockId = object.name;
                else this.memory.moveLockId = object.id;

                this.memory.moveLockRoom === this.room.name
                this.memory.moveLockWaypoint = calculateToPoint(this, object);
            }
            this.moveTo(this.memory.moveLockWaypoint.x, this.memory.moveLockWaypoint.y);
        }
        else{
            this.moveTo(object);
        }

    };

    screepPrototype.moveToRoomPosition = function(posx, posy, room){

        var calculateToPoint = function(creep, room){
            var exit = creep.room.findExitTo(room);
            var pointTo = creep.pos.findClosest(exit);

            return {
                x:pointTo.x,
                y:pointTo.y
            };
        };

        if(room.name !== this.room.name){
            if(this.memory.moveLockId && this.memory.moveLockId === room.name){
                if(this.memory.moveLockRoom && this.memory.moveLockRoom === this.room.name && this.memory.moveLockWaypoint){
                    //No need to recalculate, just move
                }
                else{
                    this.memory.moveLockRoom = this.room.name;
                    this.memory.moveLockWaypoint = calculateToPoint(this, room);
                }
            }
            else{
                this.memory.moveLockId = room.name;
                this.memory.moveLockRoom === this.room.name
                this.memory.moveLockWaypoint = calculateToPoint(this, room);
            }
            this.moveTo(this.memory.moveLockWaypoint.x, this.memory.moveLockWaypoint.y);
        }
        else{
            this.moveTo(posx, posy);
        }

    };

}
