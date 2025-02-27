let creepLogic = require('./creeps');
let roomLogic = require('./room');
let traveler = require('./prototypes/traveler');

module.exports.loop = function() {
	// make a list of all of our rooms
	Game.myRooms = _.filter(Game.rooms, (r) => r.controller && r.controller.level > 0 && r.controller.my);

	// run spawn logic for each room in our empire
	_.forEach(Game.myRooms, (room) => roomLogic.spawning(room));

	// run defense logic for each room in our empire
	_.forEach(Game.myRooms, (room) => roomLogic.defense(room));

	// once every 500 ticks, run source identifying logic for each room
	if (Game.time % 500 == 0) {
		_.forEach(Game.myRooms, (room) => roomLogic.identify(room));
	}

	// run each creep role see /creeps/index.js
	for (var name in Game.creeps) {
		var creep = Game.creeps[name];

		let role = creep.memory.role;
		if (creepLogic[role]) {
			creepLogic[role].run(creep);
		}
	}

	// free up memory if creep no longer exists
	for (var name in Memory.creeps) {
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
			console.log('Clearing non-existing creep memory:', name);
		}
	}
};
