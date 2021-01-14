/* This header is placed at the beginning of the output file and defines the
	special `__require`, `__getFilename`, and `__getDirname` functions.
*/
(function() {
	/* __modules is an Array of functions; each function is a module added
		to the project */
var __modules = {},
	/* __modulesCache is an Array of cached modules, much like
		`require.cache`.  Once a module is executed, it is cached. */
	__modulesCache = {},
	/* __moduleIsCached - an Array of booleans, `true` if module is cached. */
	__moduleIsCached = {};
/* If the module with the specified `uid` is cached, return it;
	otherwise, execute and cache it first. */
function __require(uid, parentUid) {
	if(!__moduleIsCached[uid]) {
		// Populate the cache initially with an empty `exports` Object
		__modulesCache[uid] = {"exports": {}, "loaded": false};
		__moduleIsCached[uid] = true;
		if(uid === 0 && typeof require === "function") {
			require.main = __modulesCache[0];
		} else {
			__modulesCache[uid].parent = __modulesCache[parentUid];
		}
		/* Note: if this module requires itself, or if its depenedencies
			require it, they will only see an empty Object for now */
		// Now load the module
		__modules[uid].call(this, __modulesCache[uid], __modulesCache[uid].exports);
		__modulesCache[uid].loaded = true;
	}
	return __modulesCache[uid].exports;
}
/* This function is the replacement for all `__filename` references within a
	project file.  The idea is to return the correct `__filename` as if the
	file was not concatenated at all.  Therefore, we should return the
	filename relative to the output file's path.

	`path` is the path relative to the output file's path at the time the
	project file was concatenated and added to the output file.
*/
function __getFilename(path) {
	return require("path").resolve(__dirname + "/" + path);
}
/* Same deal as __getFilename.
	`path` is the path relative to the output file's path at the time the
	project file was concatenated and added to the output file.
*/
function __getDirname(path) {
	return require("path").resolve(__dirname + "/" + path + "/../");
}
/********** End of header **********/
/********** Start module 0: C:\Users\walke\Documents\Coding\screeps code folder\src\main.js **********/
__modules[0] = function(module, exports) {
let creepLogic = __require(1,0);
let roomLogic = __require(2,0);

module.exports.loop = function() {
	Game.myRooms = _.filter(Game.rooms, (r) => r.controller && r.controller.level > 0 && r.controller.my);
	_.forEach(Game.myRooms, (room) => roomLogic.spawning(room));
	_.forEach(Game.myRooms, (room) => roomLogic.defense(room));
	if (Game.time % 500 == 0) {
		_.forEach(Game.myRooms, (room) => roomLogic.identify(room));
	}
	for (var name in Game.creeps) {
		var creep = Game.creeps[name];

		let role = creep.memory.role;
		if (creepLogic[role]) {
			creepLogic[role].run(creep);
		}
	}
	for (var name in Memory.creeps) {
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
			console.log('Clearing non-existing creep memory:', name);
		}
	}
};

return module.exports;
}
/********** End of module 0: C:\Users\walke\Documents\Coding\screeps code folder\src\main.js **********/
/********** Start module 1: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\index.js **********/
__modules[1] = function(module, exports) {
let creepLogic = {
	builder: __require(3,1),
	harvester: __require(4,1),
	upgrader: __require(5,1)
};

module.exports = creepLogic;

return module.exports;
}
/********** End of module 1: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\index.js **********/
/********** Start module 2: C:\Users\walke\Documents\Coding\screeps code folder\src\room\index.js **********/
__modules[2] = function(module, exports) {
let roomLogic = {
	defense: __require(6,2),
	identify: __require(7,2),
	spawning: __require(8,2)
};

module.exports = roomLogic;

return module.exports;
}
/********** End of module 2: C:\Users\walke\Documents\Coding\screeps code folder\src\room\index.js **********/
/********** Start module 3: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\builder.js **********/
__modules[3] = function(module, exports) {
let prototypes = __require(9,3);

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
			creep.harvestEnergy();
		}
	},
	spawn: function(room) {
		let builderTarget = _.get(room.memory, [ 'census', 'builder' ], 2);

		var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == room.name);
		console.log('Builder: ' + builders.length, room.name);

		var sites = room.find(FIND_CONSTRUCTION_SITES);
		if (sites.length > 0 && builders.length < builderTarget) {
			return true;
		}
	},
	spawnData: function(room) {
		let name = 'Builder' + Game.time;
		let body = Creep.getBody([ WORK, CARRY, MOVE ], room);
		let memory = { role: 'builder', homeRoom: room.name };

		return { name, body, memory };
	}
};

module.exports = builder;

return module.exports;
}
/********** End of module 3: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\builder.js **********/
/********** Start module 4: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\harvester.js **********/
__modules[4] = function(module, exports) {
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
				let target = creep.pos.findClosestByRange(targets);
				if (creep.pos.isNearTo(target)) {
					creep.transfer(target, RESOURCE_ENERGY);
				} else {
					creep.moveTo(target);
				}
			}
		} else {
			creep.harvestEnergy();
		}
	},
	spawn: function(room) {
		let harvesterTarget = _.get(room.memory, [ 'census', 'harvester' ], 2);

		var harvesters = _.filter(
			Game.creeps,
			(creep) => creep.memory.role == 'harvester' && creep.room.name == room.name
		);
		console.log('Harvesters: ' + harvesters.length, room.name);

		if (harvesters.length < harvesterTarget) {
			return true;
		}
	},
	spawnData: function(room) {
		let name = 'Harvester' + Game.time;
		let body = Creep.getBody([ WORK, CARRY, MOVE ], room);
		let memory = { role: 'harvester', homeRoom: room.name };

		return { name, body, memory };
	}
};

module.exports = harvester;

return module.exports;
}
/********** End of module 4: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\harvester.js **********/
/********** Start module 5: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\upgrader.js **********/
__modules[5] = function(module, exports) {
const { upgrader } = __require(1,5);

var roleUpgrader = {
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
	spawn: function(room) {
		let upgraderTarget = _.get(room.memory, [ 'census', 'upgrader' ], 2);

		var upgraders = _.filter(
			Game.creeps,
			(creep) => creep.memory.role == 'upgrader' && creep.room.name == room.name
		);
		console.log('Upgraders: ' + upgraders.length, room.name);

		if (upgraders.length < upgraderTarget) {
			return true;
		}
	},
	spawnData: function(room) {
		let name = 'Upgrader' + Game.time;
		let body = Creep.getBody([ WORK, CARRY, MOVE ], room);
		let memory = { role: 'upgrader', homeRoom: room.name };

		return { name, body, memory };
	}
};

module.exports = roleUpgrader;

return module.exports;
}
/********** End of module 5: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\upgrader.js **********/
/********** Start module 6: C:\Users\walke\Documents\Coding\screeps code folder\src\room\defense.js **********/
__modules[6] = function(module, exports) {
function towerDefense(room) {
	var towers = room.find(FIND_MY_STRUCTURES, {
		filter: { structureType: STRUCTURE_TOWER }
	});

	if (towers.length) {
		_.forEach(towers, function(tower) {
			var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: (structure) => StructureTerminal.hits < structure.hitsMax
			});
			if (closestDamagedStructure) {
				tower.repair(closestDamagedStructure);
			}

			var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if (closestHostile) {
				tower.attack(closestHostile);
			}
		});
	}
}

module.exports = towerDefense;
return module.exports;
}
/********** End of module 6: C:\Users\walke\Documents\Coding\screeps code folder\src\room\defense.js **********/
/********** Start module 7: C:\Users\walke\Documents\Coding\screeps code folder\src\room\identify.js **********/
__modules[7] = function(module, exports) {
function identifySources(room) {
	let sources = room.find(FIND_SOURCES);
	room.memory.resources = {};
	_.forEach(sources, function(source) {
		let data = _.get(room.memory, [ 'resources', room.name, 'energy', source.id ]);
		if (data === undefined) {
			_.set(room.memory, [ 'resources', room.name, 'energy', source.id ], {});
		}
	});
}

module.exports = identifySources;

return module.exports;
}
/********** End of module 7: C:\Users\walke\Documents\Coding\screeps code folder\src\room\identify.js **********/
/********** Start module 8: C:\Users\walke\Documents\Coding\screeps code folder\src\room\spawning.js **********/
__modules[8] = function(module, exports) {
let creepLogic = __require(1,8);
let creepTypes = _.keys(creepLogic);

function spawnCreeps(room) {
	_.forEach(creepTypes, (type) => console.log(type));
	let creepTypeNeeded = _.find(creepTypes, function(type) {
		return creepLogic[type].spawn(room);
	});
	let creepSpawnData = creepLogic[creepTypeNeeded] && creepLogic[creepTypeNeeded].spawnData(room);

	if (creepSpawnData) {
		console.log(room, JSON.stringify(creepSpawnData));

		let spawn = room.find(FIND_MY_SPAWNS)[0];
		let result = spawn.spawnCreep(creepSpawnData.body, creepSpawnData.name, { memory: creepSpawnData.memory });

		console.log('Tried to Spawn:', creepTypeNeeded, result);
	}
}

module.exports = spawnCreeps;

return module.exports;
}
/********** End of module 8: C:\Users\walke\Documents\Coding\screeps code folder\src\room\spawning.js **********/
/********** Start module 9: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\index.js **********/
__modules[9] = function(module, exports) {
let files = {
	creep: __require(10,9),
	roomPosition: __require(11,9)
};

module.exports = files;

return module.exports;
}
/********** End of module 9: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\index.js **********/
/********** Start module 10: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\creep.js **********/
__modules[10] = function(module, exports) {
Creep.prototype.findEnergySource = function findEnergySource() {
	let source;
	if (this.memory.sourceId) {
		source = Game.getObjectById(this.memory.sourceId);
	}
	if (!source) {
		let sources = this.room.find(FIND_SOURCES);
		if (sources.length) {
			source = _.find(sources, function(s) {
				return s.pos.getOpenPositions().length > 0;
			});
		}
	}

	if (source) {
		this.memory.source = source.id;

		return source;
	}
};

Creep.prototype.harvestEnergy = function harvestEnergy() {
	if (this.memory.targetRoom && this.memory.targetRoom !== this.room.name) {
		return this.moveToRoom(this.memory.targetRoom);
	}

	let storedSource = Game.getObjectById(this.memory.source);
	if (!storedSource || (!storedSource.pos.getOpenPositions().length && !this.pos.isNearTo(storedSource))) {
		delete this.memory.source;
		storedSource = this.findEnergySource();
	}

	if (storedSource) {
		if (this.pos.isNearTo(storedSource)) {
			this.harvest(storedSource);
		} else {
			this.moveTo(storedSource, { visualizePathStyle: { stroke: '#ffaa00' } });
		}
	}
};

Creep.prototype.moveToRoom = function moveToRoom(roomName) {
	this.moveTo(new RoomPosition(25, 25, roomName));
};

Creep.getBody = function(segment, room) {
	let body = [];
	let segmentCost = _.sum(segment, (s) => BODYPART_COST[s]);
	let energyAvailable = room.energyAvailable;
	let maxSegments = Math.floor(energyAvailable / segmentCost);
	_.times(maxSegments, function() {
		_.forEach(segment, (s) => body.push(s));
	});
	console.log(body, maxSegments, energyAvailable, room);
	return body;
};

return module.exports;
}
/********** End of module 10: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\creep.js **********/
/********** Start module 11: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\roomPosition.js **********/
__modules[11] = function(module, exports) {
RoomPosition.prototype.getNearbyPositions = function getNearbyPositions() {
	var positions = [];

	let startX = this.x - 1 || 1;
	let startY = this.y - 1 || 1;

	for (x = startX; x <= this.x + 1 && x < 49; x++) {
		for (y = startY; y <= this.y + 1 && y < 49; y++) {
			if (x !== this.x || y !== this.y) {
				positions.push(new RoomPosition(x, y, this.roomName));
			}
		}
	}

	return positions;
};

RoomPosition.prototype.getOpenPositions = function getOpenPositions() {
	let nearbyPositions = this.getNearbyPositions();

	let terrain = Game.map.getRoomTerrain(this.roomName);

	let walkablePositions = _.filter(nearbyPositions, function(pos) {
		return terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL;
	});

	let freePositions = _.filter(walkablePositions, function(pos) {
		return !pos.lookFor(LOOK_CREEPS).length;
	});

	return freePositions;
};


return module.exports;
}
/********** End of module 11: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\roomPosition.js **********/
/********** Footer **********/
if(typeof module === "object")
	module.exports = __require(0);
else
	return __require(0);
})();
/********** End of footer **********/
