let creepLogic = require('./creeps');
let roomLogic = require('./room');
let prototypes = require('./prototypes');

function getBody(segment, room) {
    let body = [];

    //how much each segment costs
    let segmentCost = _.sum(segment, s => BODYPART_COST[s]);

    // how much energy we can use total
    let energyAvailable = room.energyCapacityAvailable;

    // how many times we can include the segment with room energy
    let maxSegments = Math.floor(energyAvailable / segmentCost);

    // push the segment multiple times
    _.times(maxSegments, function () {
        _.forEach(segment, s=> body.push(s));
    });

    return body;
}

module.exports.loop = function () {
    // make a list of all of our rooms
    Game.myRooms = _.filter(Game.rooms, r => r.controller && r.controller.level > 0 && r.controller.my);

    // run spawn logic for each room in our empire
    _.forEach(Game.myRooms, r => roomLogic.spawning(r));
    
    // run each creep role see /creeps/index.js
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        let role = creep.memory.role;
        if (creepLogic[role]) {
            creepLogic[role].run(creep);
        }
    }

    // free up memory if creep no longer exists
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}