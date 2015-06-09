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

module.exports = {
    createRoads:createRoads,
    createNewExtension:createNewExtension
}