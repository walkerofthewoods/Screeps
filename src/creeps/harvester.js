var harvester = {
	/** @param {Creep} creep **/
	run: function(creep) {
		if (creep.store.getFreeCapacity() > 0) {
			var sources = creep.room.find(FIND_SOURCES);
			if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
			}
		} else {
			var targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (
						(structure.structureType == STRUCTURE_EXTENSION ||
							structure.structureType == STRUCTURE_SPAWN ||
							structure.structureType == STRUCTURE_TOWER) &&
						structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
					);
				}
			});
			if (targets.length > 0) {
				if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
				}
			}
		}
	},
	// checks if the room needs to spawn a creep
	spawn: function(room) {
		var harvesters = _.filter(
			Game.creeps,
			(creep) => creep.memory.role == 'harvester' && creep.room.name == room.name
		);
		console.log('Harvesters: ' + harvesters.length, room.name);

		if (harvesters.length < 4) {
			return true;
		}
	},
	// returns an object with the data to spawn a new creep
	spawnData: function(room) {
		let name = 'Harvester' + Game.time;
		let body = getBody([ WORK, CARRY, MOVE ], room);
		let memory = { role: 'harvester' };

		return { name, body, memory };
	}
};

module.exports = harvester;
