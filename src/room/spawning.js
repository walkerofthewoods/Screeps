let creepLogic = require('../creeps/index');
const { spawn } = require('../creeps/upgrader');
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

		let spawns = room.find(FIND_MY_SPAWNS);

		// iterate thru spawns until finding first available spawn and using it
		spawns.some(function(spawn) {
			if (spawn.spawning) {
				return false;
			} else {
				let result = spawn.spawnCreep(creepSpawnData.body, creepSpawnData.name, {
					memory: creepSpawnData.memory
				});
				console.log('Tried to Spawn:', creepTypeNeeded, result);
				return true;
			}
		});
	}
}

module.exports = spawnCreeps;
