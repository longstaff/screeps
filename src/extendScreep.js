module.exports = function (screepPrototype) {

    screepPrototype.moveToRoomObject = function(object){
        if(!this) return;

        if(object.room.name !== this.room.name){
            if(this.memory.moveLockId && (this.memory.moveLockId === object.name || this.memory.moveLockId === object.id)){
                if(this.memory.moveLockRoom && this.memory.moveLockRoom === this.room.name && this.memory.moveLockWaypoint){
                    //No need to recalculate, just move
                    //console.log("Saving calculations!");
                }
                else{
                    this.memory.moveLockRoom = this.room.name;
                    this.memory.moveLockWaypoint = this.calculateToPoint(object);
                }
            }
            else{
                if(object.name) this.memory.moveLockId = object.name;
                else this.memory.moveLockId = object.id;

                this.memory.moveLockRoom === this.room.name
                this.memory.moveLockWaypoint = this.calculateToPoint(object);
            }
            this.moveTo(this.memory.moveLockWaypoint.x, this.memory.moveLockWaypoint.y);
        }
        else{
            this.moveTo(object);
        }

    };

    screepPrototype.moveToRoomPosition = function(posx, posy, room){
        if(!this) return;

        if(room.name !== this.room.name){
            if(this.memory.moveLockId && this.memory.moveLockId === room.name){
                if(this.memory.moveLockRoom && this.memory.moveLockRoom === this.room.name && this.memory.moveLockWaypoint){
                    //No need to recalculate, just move
                    //console.log("Saving calculations!");
                }
                else{
                    this.memory.moveLockRoom = this.room.name;
                    this.memory.moveLockWaypoint = this.calculateToPoint(room);
                }
            }
            else{
                this.memory.moveLockId = room.name;
                this.memory.moveLockRoom === this.room.name
                this.memory.moveLockWaypoint = this.calculateToPoint(room);
            }
            this.moveTo(this.memory.moveLockWaypoint.x, this.memory.moveLockWaypoint.y);
        }
        else{
            this.moveTo(posx, posy);
        }

    };
    screepPrototype.calculateToPoint = function(room){
        var exit = this.room.findExitTo(room);
        var pointTo = this.pos.findClosest(exit);

        return {
            x:pointTo.x,
            y:pointTo.y
        };
    };

    screepPrototype.moveToTargetPosition = function(location){
        if(!this) return;
        if(!this.memory.loc) this.memory.loc = [];
        if(!this.memory.loc[location]){
            return false;
        }
        else{
            var room = Game.rooms[this.memory.loc[location].room];
            this.moveToRoomPosition(this.memory.loc[location].x, this.memory.loc[location].y, Game.rooms[this.memory.loc[location].room]);
            return true;
        }
    }
    screepPrototype.getTargetPosition = function(location){
        if(!this) return;
        if(!this.memory.loc) this.memory.loc = [];
        return this.memory.loc[location];
    }
    screepPrototype.setTargetPosition = function(location, x, y, roomName){
        if(!this) return;
        this.memory.loc[location] = {
            x:x,
            y:y,
            room:roomName
        }
        this.moveToTargetPosition(location);
    }
    screepPrototype.clearTargetPosition = function(location){
        if(!this) return;
        if(!this.memory.loc) this.memory.loc = [];
        this.memory.loc[location] = null;
    }

}
