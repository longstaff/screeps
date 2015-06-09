var nextRoomName = function(room, direction){
    var ew = room[0];
    var ewval = +room[1];

    var ns = room[2];
    var nsval = +room[3];

    if(direction === FIND_EXIT_TOP){
        if(ns === "N"){
            return ew + ewval + ns + (nsval+1);
        }
        else{
            if(nsval === 1){
                return ew + ewval + "N1";
            }
            else{
                return ew + ewval + ns + (nsval-1);
            }
        }
    }
    else if(direction === FIND_EXIT_RIGHT){
        if(ns === "E"){
            return ew + (ewval+1) + ns + nsval;
        }
        else{
            if(nsval === 1){
                return "E1" + ns + nsval;
            }
            else{
                return ew + (ewval-1) + ns + nsval;
            }
        }
    }
    else if(direction === FIND_EXIT_BOTTOM){
        if(ns === "S"){
            return ew + ewval + ns + (nsval+1);
        }
        else{
            if(nsval === 1){
                return ew + ewval + "S1";
            }
            else{
                return ew + ewval + ns + (nsval-1);
            }
        }
    }
    else if(direction === FIND_EXIT_LEFT){
        if(ns === "W"){
            return ew + (ewval+1) + ns + nsval;
        }
        else{
            if(nsval === 1){
                return "W1" + ns + nsval;
            }
            else{
                return ew + (ewval-1) + ns + nsval;
            }
        }
    }
}

module.exports = function (creepObj) {
    var room = creepObj.room;

    if(room.name === creepObj.memory.targetRoom){
        creepObj.memory.targetRoom = null;
    }

    if(creepObj.memory.targetRoom){
        var exit = room.findExitTo(creepObj.memory.targetRoom);
        var pointTo = creepObj.pos.findClosest(exit);
        creepObj.moveTo(pointTo);
    }
    else{
        var top = room.find(FIND_EXIT_TOP);
        var bottom = room.find(FIND_EXIT_BOTTOM);
        var left = room.find(FIND_EXIT_LEFT);
        var right = room.find(FIND_EXIT_RIGHT);

        var nextRooms = [];
        var exploredRooms = [];
        if(top){
            var roomName = nextRoomName(room.name, FIND_EXIT_TOP);
            //IF IT ISNT EXPLORED YET
            if(!Game.rooms[roomName]){
                nextRooms.push(roomName);
            }
            else{
                exploredRooms.push(roomName);
            }
        }
        if(bottom){
            var roomName = nextRoomName(room.name, FIND_EXIT_BOTTOM);
            //IF IT ISNT EXPLORED YET
            if(!Game.rooms[roomName]){
                nextRooms.push(roomName);
            }
            else{
                exploredRooms.push(roomName);
            }
        }
        if(left){
            var roomName = nextRoomName(room.name, FIND_EXIT_LEFT);
            //IF IT ISNT EXPLORED YET
            if(!Game.rooms[roomName]){
                nextRooms.push(roomName);
            }
            else{
                exploredRooms.push(roomName);
            }
        }
        if(right){
            var roomName = nextRoomName(room.name, FIND_EXIT_RIGHT);
            //IF IT ISNT EXPLORED YET
            if(!Game.rooms[roomName]){
                nextRooms.push(roomName);
            }
            else{
                exploredRooms.push(roomName);
            }
        }

        if(nextRooms.length){
            creepObj.memory.targetRoom = nextRooms[Math.floor(Math.random()*nextRooms.length)];
        }
        else{
            creepObj.memory.targetRoom = exploredRooms[Math.floor(Math.random()*exploredRooms.length)];
        }
    }
    
}
