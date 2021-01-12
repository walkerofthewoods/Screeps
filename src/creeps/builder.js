var builder = {
	/** @param {Creep} creep **/
	run: function(creep) {
		if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
			creep.memory.building = false;
			creep.say('🔄 harvest');
		}
		if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
			creep.memory.building = true;
			creep.say('🚧 build');
		}

		if (creep.memory.building) {
			var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
			if (targets.length) {
				if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
				}
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
		var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == room.name);
		console.log('Builders: ' + builders.length, room.name);

		if (builders.length < 2) {
			return true;
		}
	},
	// returns an object with the data to spawn a new creep
	spawnData: function(room) {
		let name = 'Builder' + Game.time;
		let body = [ WORK, CARRY, MOVE ];
		let memory = { role: 'builder' };

		return { name, body, memory };
	}
};

module.exports = builder;
