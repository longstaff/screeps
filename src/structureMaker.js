var Constants = require('const');

function createRoads(outposts, room){

    var tiles = [];

    for(var outpost in outposts){

        var pos = room.getPositionAt(outposts[outpost].posX, outposts[outpost].posY);

        var pathToMine;
        var sources = pos.findInRange(FIND_SOURCES, Constants.DISTANCE_MINE);

        roadAroundPoint(room, pos, pos, tiles);

        for(var source in sources){
            roadAroundPoint(room, pos, sources[source].pos, tiles);
        }

        if(room.controller){
            roadAroundPoint(room, pos, room.controller.pos, tiles);
        }

        makeRoadOfPath(room, tiles);
    }
}
function roadAroundPoint(room, from, to, tiles){
    for(var i=0; i<9; i++){
        if(i != 4){
            var radPoint = room.getPositionAt(to.x -1 + (i%3), to.y -1 + (Math.floor(i/3)));
            addRoadPathTo(tiles, radPoint);
            var pathToPoint = room.findPath(radPoint, from, {ignoreCreeps:true});

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
function makeRoadOfPath(room, path){
    for(var step in path){
        room.createConstructionSite(path[step].x, path[step].y, STRUCTURE_ROAD);
    }
}

function buildExtensions(level, outposts, room){
    var allowed = [0,5,10,20,30,40,50,60];
    var currentAllowed = allowed[level];
    var currentCount = room.find(FIND_MY_STRUCTURES, {
        filter:function(i){
            return i.structureType === STRUCTURE_EXTENSION;
        }
    }).concat(room.find(FIND_CONSTRUCTION_SITES, {
        filter:function(i){
            return i.structureType === STRUCTURE_EXTENSION;
        }
    })).length;

    if(currentCount < currentAllowed){
        for(var i=currentCount; i<currentAllowed; i++){
            createNewExtension(outposts[i%outposts.length], room);
        }
    }
}
function createNewExtension(object, room){

    //TODO: Find a better way to do this!
    var buildPos = room.getPositionAt(object.posX, object.posY);
    var construct = -7;
    var i = 0;

    for(var i=0; i<25; i++){
        construct = room.createConstructionSite(buildPos.x -2 + (i % 5), buildPos.y -7 + (2*Math.floor(i / 5)), STRUCTURE_EXTENSION);

        if(construct !== -7 && construct !== -10){
            break;
        }
    }
}

function createRoomDefenses(exits, room){

    /*
    var strip = [];
    //Has to be 2 steps off to be legal
    var top = room.find(FIND_EXIT_TOP);
    var strips = [];
    for(var space in top){

    }
    strip = strip.concat(calculateWalls(room, room.find(FIND_EXIT_TOP), FIND_EXIT_TOP, 2));
    strip = strip.concat(calculateWalls(room, room.find(FIND_EXIT_BOTTOM), FIND_EXIT_BOTTOM, 2));
    strip = strip.concat(calculateWalls(room, room.find(FIND_EXIT_LEFT), FIND_EXIT_LEFT, 2));
    strip = strip.concat(calculateWalls(room, room.find(FIND_EXIT_RIGHT), FIND_EXIT_RIGHT, 2));

    createWallDefence(room, strip, level);
    */
}

function buildLocalRamparts(outposts, room){
    //Build small walls for each of the outposts if there is a spawn.

    /*
    for(var outpost in outposts){

    }
    */
}

/*
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
*/

module.exports = {
    buildExtensions:buildExtensions,
    buildLocalRamparts:buildLocalRamparts,
    buildRoads:createRoads,
    buildWalls:createRoomDefenses
}
