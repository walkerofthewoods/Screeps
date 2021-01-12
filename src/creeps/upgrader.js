var roleUpgrader = {
	/** @param {Creep} creep **/
	run: function(creep) {
		if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
			creep.memory.upgrading = false;
			creep.say('🔄 harvest');
		}
		if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
			creep.memory.upgrading = true;
			creep.say('⚡ upgrade');
		}

		if (creep.memory.upgrading) {
			if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
			}
		} else {
			var sources = creep.room.find(FIND_SOURCES);
			if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
			}
		}
	},
	// checks if the room needs to spawn a creep
	spawn: function(room) {
		var upgraders = _.filter(
			Game.creeps,
			(creep) => creep.memory.role == 'upgrader' && creep.room.name == room.name
		);
		console.log('Upgraders: ' + upgraders.length, room.name);

		if (upgraders.length < 4) {
			return true;
		}
	},
	// returns an object with the data to spawn a new creep
	spawnData: function(room) {
		let name = 'Upgrader' + Game.time;
		let body = getBody([ WORK, CARRY, MOVE ], room);
		let memory = { role: 'upgrader' };

		return { name, body, memory };
	}
};

module.exports = roleUpgrader;
