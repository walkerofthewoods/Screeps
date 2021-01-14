let creepLogic = require('../creeps/index');
let creepTypes = _.keys(creepLogic);

function spawnCreeps(room) {
	// lists all the creep types to console
	_.forEach(creepTypes, (type) => console.log(type));

	// find a creep type that returns true for the .spawn() function
	let creepTypeNeeded = _.find(creepTypes, function(type) {
		return creepLogic[type].spawn(room);
	});

	// get the data for spawning a new creep of creepTypeNeeded
	let creepSpawnData = creepLogic[creepTypeNeeded] && creepLogic[creepTypeNeeded].spawnData(room);

	if (creepSpawnData) {
		console.log(room, JSON.stringify(creepSpawnData));
		// find the first or 0th spawn in the room
		// improvement needed: should be checking for not just the first spawn,
		// but first spawn that isn't spawning a creep
		let spawn = room.find(FIND_MY_SPAWNS)[0];
		let result = spawn.spawnCreep(creepSpawnData.body, creepSpawnData.name, { memory: creepSpawnData.memory });

		console.log('Tried to Spawn:', creepTypeNeeded, result);
	}
}

module.exports = spawnCreeps;
