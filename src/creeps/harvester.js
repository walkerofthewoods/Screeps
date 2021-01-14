var harvester = {
	/** @param {Creep} creep **/
	run: function(creep) {
		if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
			creep.memory.working = false;
			creep.say('🔄 harvest');
		}
		if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
			creep.memory.working = true;
			creep.say('filling');
		}

		if (creep.memory.working) {
			var targets = creep.room.find(FIND_MY_STRUCTURES);
			targets = _.filter(targets, function(struct) {
				return (
					(struct.structureType == STRUCTURE_TOWER ||
						struct.structureType == STRUCTURE_EXTENSION ||
						struct.structureType == STRUCTURE_SPAWN) &&
					struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0
				);
			});
			if (targets.length) {
				// find closest target to creep
				let target = creep.pos.findClosestByRange(targets);

				// move to target
				if (creep.pos.isNearTo(target)) {
					// transfer energy
					creep.transfer(target, RESOURCE_ENERGY);
				} else {
					creep.moveTo(target);
				}
			}
		} else {
			creep.harvestEnergy();
		}
	},
	// checks if the room needs to spawn a creep
	spawn: function(room) {
		let harvesterTarget = _.get(room.memory, [ 'census', 'harvester' ], 1);

		var harvesters = _.filter(
			Game.creeps,
			(creep) => creep.memory.role == 'harvester' && creep.room.name == room.name
		);
		console.log('Harvesters: ' + harvesters.length, room.name);

		if (harvesters.length < harvesterTarget) {
			return true;
		}
	},
	// returns an object with the data to spawn a new creep
	spawnData: function(room) {
		let name = 'Harvester' + Game.time;
		let body = Creep.getBody([ WORK, CARRY, MOVE ], room);
		let memory = { role: 'harvester', homeRoom: room.name };

		return { name, body, memory };
	}
};

module.exports = harvester;
