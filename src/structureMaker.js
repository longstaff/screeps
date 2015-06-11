function createRoads(spawn){
    var pathToMine;
    var sources = spawn.pos.findInRange(FIND_SOURCES, 10);
    var tiles = [];
    
    roadAroundPoint(spawn, spawn.pos, tiles);
    
    for(var source in sources){
        roadAroundPoint(spawn, sources[source].pos, tiles);
    }
    
    if(spawn.room.controller){
        roadAroundPoint(spawn, spawn.room.controller.pos, tiles);
    }
    
    makeRoadOfPath(spawn, tiles);
}
function roadAroundPoint(spawn, point, tiles){
    for(var i=0; i<9; i++){
        if(i != 4){
            var radPoint = spawn.room.getPositionAt(point.x -1 + (i%3), point.y -1 + (Math.floor(i/3)));
            addRoadPathTo(tiles, radPoint);
            var pathToPoint = spawn.room.findPath(radPoint, spawn.pos, {ignoreCreeps:true});
            
    	    for(var step in pathToPoint){
    	        addRoadPathTo(tiles, pathToPoint[step]);
    	    }
        }
    }
}
function addRoadPathTo(arr, point){
    for(tile in arr){
        if(arr[tile].x === point.x && arr[tile].y === point.y){
            //Dont add
            return;
        }
    }
    arr.push(point);
}
function makeRoadOfPath(spawn, path){
    for(var step in path){
        spawn.room.createConstructionSite(path[step].x, path[step].y, STRUCTURE_ROAD);
    }
}

function createNewExtension(spawn){
    
    var buildPos = spawn.pos;
    var construct = -7;
    var i = 0;
    
    for(var i=0; i<25; i++){
        construct = spawn.room.createConstructionSite(buildPos.x -2 + (i % 5), buildPos.y -7 + (2*Math.floor(i / 5)), STRUCTURE_EXTENSION);
        
        if(construct !== -7 && construct !== -10){
            break;
        }
    }
        
    if(construct != -7 && construct != -10){
        return true;
    }
    else{
        return false;
    }
}

function createRoomDefenses(room, level){

    var strip = [];
    //Has to be 2 steps off to be legal
    strip = strip.concat(calculateWalls(room, room.find(FIND_EXIT_TOP), FIND_EXIT_TOP, 2));
    strip = strip.concat(calculateWalls(room, room.find(FIND_EXIT_BOTTOM), FIND_EXIT_BOTTOM, 2));
    strip = strip.concat(calculateWalls(room, room.find(FIND_EXIT_LEFT), FIND_EXIT_LEFT, 2));
    strip = strip.concat(calculateWalls(room, room.find(FIND_EXIT_RIGHT), FIND_EXIT_RIGHT, 2));
    
    createWallDefence(room, strip, level);

}
function calculateWalls(room, walls, direction, offset){
    var strip = [];

    if(walls.length){
        var first = walls[0];
        var last = walls[walls.length-1];

        if(direction === FIND_EXIT_TOP){
            var y = walls[0].y+offset;
            for(var i=0; i<walls.length; i++){
                strip.push({x:walls[i].x, y:y});
            }

            var x = walls[0].x;
            while(
                (room.lookAt(x, y)[0].terrain !== 'wall' && room.lookAt(x, y-1)[0].terrain !== 'wall') && x > 0
            ){
                strip.push({x:x, y:y});
                x--;
            }
            
            x = walls[walls.length-1].x;
            while(
                (room.lookAt(x, y)[0].terrain !== 'wall' && room.lookAt(x, y-1)[0].terrain !== 'wall') && x < 49
            ){
                strip.push({x:x, y:y});
                x++;
            }
        }
        if(direction === FIND_EXIT_BOTTOM){
            var y = walls[0].y-offset;
            for(var i=0; i<walls.length; i++){
                strip.push({x:walls[i].x, y:y});
            }

            var x = walls[0].x;
            while(
                (room.lookAt(x, y)[0].terrain !== 'wall' && room.lookAt(x, y+1)[0].terrain !== 'wall') && x > 0
            ){
                strip.push({x:x, y:y});
                x--;
            }
            
            x = walls[walls.length-1].x;
            while(
                (room.lookAt(x, y)[0].terrain !== 'wall' && room.lookAt(x, y+1)[0].terrain !== 'wall') && x < 49
            ){
                strip.push({x:x, y:y});
                x++;
            }
        }
        if(direction === FIND_EXIT_LEFT){
            var x = walls[0].x+offset;
            for(var i=0; i<walls.length; i++){
                strip.push({x:x, y:walls[i].y});
            }

            var y = walls[0].y;
            while(
                (room.lookAt(x, y)[0].terrain !== 'wall' && room.lookAt(x-1, y)[0].terrain !== 'wall') && y > 0
            ){
                strip.push({x:x, y:y});
                y--;
            }
            
            x = walls[walls.length-1].y;
            while(
                (room.lookAt(x, y)[0].terrain !== 'wall' && room.lookAt(x-1, y)[0].terrain !== 'wall') && y < 49
            ){
                strip.push({x:x, y:y});
                y++;
            }
        }
        if(direction === FIND_EXIT_RIGHT){
            var x = walls[0].x-offset;
            for(var i=0; i<walls.length; i++){
                strip.push({x:x, y:walls[i].y});
            }

            var y = walls[0].y;
            while(
                (room.lookAt(x, y)[0].terrain !== 'wall' && room.lookAt(x+1, y)[0].terrain !== 'wall') && y > 0
            ){
                strip.push({x:x, y:y});
                y--;
            }
            
            y = walls[walls.length-1].y;
            while(
                (room.lookAt(x, y)[0].terrain !== 'wall' && room.lookAt(x+1, y)[0].terrain !== 'wall') && y < 49
            ){
                strip.push({x:x, y:y});
                y++;
            }
        }
    }
    
    return strip;
    
}
function createWallDefence(room, area, level){
    //If level > 4 start making walls
    var finalAreas = [];
    for(var test in area){
        var found = false;
        for(var finalTest in finalAreas){
            if(area[test].x === finalAreas[finalTest].x && area[test].y === finalAreas[finalTest].y){
                found = true;
                break;
            }
        }
        if(!found){
            finalAreas.push(area[test]);
        }
    }
    
    if(finalAreas.length){
        for(var pos in finalAreas){
            room.createConstructionSite(finalAreas[pos].x, finalAreas[pos].y, STRUCTURE_RAMPART);
        }
    }
}

module.exports = {
    createRoads:createRoads,
    createNewExtension:createNewExtension,
    createRoomDefenses:createRoomDefenses
}