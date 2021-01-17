var repairer = {
	/** @param {Creep} creep **/
	run: function(creep) {
		if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
			creep.memory.working = false;
			creep.say('🔄 harvest');
		}
		if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
			creep.memory.working = true;
			creep.say('⚡ repair');
		}

		if (creep.memory.working) {
			var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: (structure) => structure.hits < structure.hitsMax
			});
			if (closestDamagedStructure) {
				if (creep.pos.inRangeTo(closestDamagedStructure, 3)) {
					creep.repair(closestDamagedStructure);
				} else {
					creep.moveTo(closestDamagedStructure);
				}
			} else {
				creep.harvestEnergy();
			}
		}
	},
	// checks if the room needs to spawn a creep
	spawn: function(room) {
		let repairerTarget = _.get(room.memory, [ 'census', 'repairer' ], 1);

		var repairers = _.filter(
			Game.creeps,
			(creep) => creep.memory.role == 'repairer' && creep.room.name == room.name
		);
		console.log('Repairers: ' + repairers.length, room.name);

		if (repairers.length < repairerTarget) {
			return true;
		}
	},
	// returns an object with the data to spawn a new creep
	spawnData: function(room) {
		let name = 'Repairer' + Game.time;
		let body = Creep.getBody([ WORK, CARRY, MOVE ], room);
		let memory = { role: 'repairer', homeRoom: room.name };

		return { name, body, memory };
	}
};

module.exports = repairer;
