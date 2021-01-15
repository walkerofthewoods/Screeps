var upgrader = {
	/** @param {Creep} creep **/
	run: function(creep) {
		if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
			creep.memory.working = false;
			creep.say('🔄 harvest');
		}
		if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
			creep.memory.working = true;
			creep.say('⚡ upgrade');
		}

		if (creep.memory.working) {
			if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
			}
		} else {
			creep.harvestEnergy();
		}
	},
	// checks if the room needs to spawn a creep
	spawn: function(room) {
		let upgraderTarget = _.get(room.memory, [ 'census', 'upgrader' ], 6);

		var upgraders = _.filter(
			Game.creeps,
			(creep) => creep.memory.role == 'upgrader' && creep.room.name == room.name
		);
		console.log('Upgraders: ' + upgraders.length, room.name);

		if (upgraders.length < upgraderTarget) {
			return true;
		}
	},
	// returns an object with the data to spawn a new creep
	spawnData: function(room) {
		let name = 'Upgrader' + Game.time;
		let body = Creep.getBody([ WORK, CARRY, MOVE ], room);
		let memory = { role: 'upgrader', homeRoom: room.name };

		return { name, body, memory };
	}
};

module.exports = upgrader;
