let prototypes = require('../prototypes');

var builder = {
	/** @param {Creep} creep **/

	// 		}
	// 	} else {
	// 		if (creep.store[RESOURCE_ENERGY] == 0) {
	// 			creep.harvestEnergy();
	// 		} else {
	// 			// var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
	// 			// 	filter: (structure) => StructureTerminal.hits < structure.hitsMax
	// 			// });
	// 			// if (closestDamagedStructure) {
	// 			// 	if (creep.pos.inRangeTo(closestDamagedStructure, 3)) {
	// 			// 		creep.repair(closestDamagedStructure);
	// 			// 	} else {
	// 			// 		creep.moveTo(closestDamagedStructure);
	// 			// 	}
	// 			// }
	// 		}
	// 	}

	//  1) creep improvement: store and reuse path in memory to reduce FIND calls
	// 				implement this by storing game object Id in Memory
	// 				(memory.mainSpawnId = Game.spawns.Spawn1.id),
	// 		then retrieving next tick by calling Game.getObjectById(Memory.mainSpawnId)

	//		2) other roles use '.working' syntax, using .building here due to multiple roles, will standardize when more clear

	run: function(creep) {
		if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
			creep.memory.building = false;
			creep.say('🔄 harvest');
		}
		if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
			creep.memory.building = true;
			creep.say('🚧 build');
		}

		// improvement - make them remember location?
		if (creep.memory.building) {
			var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
			if (targets.length) {
				if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
				}
			}
		} else {
			creep.harvestEnergy();
		}
	},

	// checks if the room needs to spawn a creep
	spawn: function(room) {
		let builderTarget = _.get(room.memory, [ 'census', 'builder' ], 1);

		var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == room.name);
		console.log('Builder: ' + builders.length, room.name);

		var sites = room.find(FIND_CONSTRUCTION_SITES);
		if (sites.length > 0 && builders.length < builderTarget) {
			return true;
		}
	},
	// returns an object with the data to spawn a new creep
	spawnData: function(room) {
		let name = 'Builder' + Game.time;
		let body = Creep.getBody([ WORK, CARRY, MOVE ], room);
		let memory = { role: 'builder', homeRoom: room.name };

		return { name, body, memory };
	}
};

module.exports = builder;
