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
let traveler = __require(3,0);

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
	builder: __require(4,1),
	harvester: __require(5,1),
	repairer: __require(6,1),
	upgrader: __require(7,1)
};

module.exports = creepLogic;

return module.exports;
}
/********** End of module 1: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\index.js **********/
/********** Start module 2: C:\Users\walke\Documents\Coding\screeps code folder\src\room\index.js **********/
__modules[2] = function(module, exports) {
let roomLogic = {
	defense: __require(8,2),
	identify: __require(9,2),
	spawning: __require(10,2)
};

module.exports = roomLogic;

return module.exports;
}
/********** End of module 2: C:\Users\walke\Documents\Coding\screeps code folder\src\room\index.js **********/
/********** Start module 3: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\traveler.js **********/
__modules[3] = function(module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
class Traveler {
	/**
     * move creep to destination
     * @param creep
     * @param destination
     * @param options
     * @returns {number}
     */
	static travelTo(creep, destination, options = {}) {
		if (!destination) {
			return ERR_INVALID_ARGS;
		}
		if (creep.fatigue > 0) {
			Traveler.circle(creep.pos, 'aqua', 0.3);
			return ERR_TIRED;
		}
		destination = this.normalizePos(destination);
		let rangeToDestination = creep.pos.getRangeTo(destination);
		if (options.range && rangeToDestination <= options.range) {
			return OK;
		} else if (rangeToDestination <= 1) {
			if (rangeToDestination === 1 && !options.range) {
				let direction = creep.pos.getDirectionTo(destination);
				if (options.returnData) {
					options.returnData.nextPos = destination;
					options.returnData.path = direction.toString();
				}
				return creep.move(direction);
			}
			return OK;
		}
		if (!creep.memory._trav) {
			delete creep.memory._travel;
			creep.memory._trav = {};
		}
		let travelData = creep.memory._trav;
		let state = this.deserializeState(travelData, destination);
		if (this.isStuck(creep, state)) {
			state.stuckCount++;
			Traveler.circle(creep.pos, 'magenta', state.stuckCount * 0.2);
		} else {
			state.stuckCount = 0;
		}
		if (!options.stuckValue) {
			options.stuckValue = DEFAULT_STUCK_VALUE;
		}
		if (state.stuckCount >= options.stuckValue && Math.random() > 0.5) {
			options.ignoreCreeps = false;
			options.freshMatrix = true;
			delete travelData.path;
		}
		if (!this.samePos(state.destination, destination)) {
			if (options.movingTarget && state.destination.isNearTo(destination)) {
				travelData.path += state.destination.getDirectionTo(destination);
				state.destination = destination;
			} else {
				delete travelData.path;
			}
		}
		if (options.repath && Math.random() < options.repath) {
			delete travelData.path;
		}
		let newPath = false;
		if (!travelData.path) {
			newPath = true;
			if (creep.spawning) {
				return ERR_BUSY;
			}
			state.destination = destination;
			let cpu = Game.cpu.getUsed();
			let ret = this.findTravelPath(creep.pos, destination, options);
			let cpuUsed = Game.cpu.getUsed() - cpu;
			state.cpu = _.round(cpuUsed + state.cpu);
			if (state.cpu > REPORT_CPU_THRESHOLD) {
				console.log(
					`TRAVELER: heavy cpu use: ${creep.name}, cpu: ${state.cpu} origin: ${creep.pos}, dest: ${destination}`
				);
			}
			let color = 'orange';
			if (ret.incomplete) {
				color = 'red';
			}
			if (options.returnData) {
				options.returnData.pathfinderReturn = ret;
			}
			travelData.path = Traveler.serializePath(creep.pos, ret.path, color);
			state.stuckCount = 0;
		}
		this.serializeState(creep, destination, state, travelData);
		if (!travelData.path || travelData.path.length === 0) {
			return ERR_NO_PATH;
		}
		if (state.stuckCount === 0 && !newPath) {
			travelData.path = travelData.path.substr(1);
		}
		let nextDirection = parseInt(travelData.path[0], 10);
		if (options.returnData) {
			if (nextDirection) {
				let nextPos = Traveler.positionAtDirection(creep.pos, nextDirection);
				if (nextPos) {
					options.returnData.nextPos = nextPos;
				}
			}
			options.returnData.state = state;
			options.returnData.path = travelData.path;
		}
		return creep.move(nextDirection);
	}
	/**
     * make position objects consistent so that either can be used as an argument
     * @param destination
     * @returns {any}
     */
	static normalizePos(destination) {
		if (!(destination instanceof RoomPosition)) {
			return destination.pos;
		}
		return destination;
	}
	/**
     * check if room should be avoided by findRoute algorithm
     * @param roomName
     * @returns {RoomMemory|number}
     */
	static checkAvoid(roomName) {
		return Memory.rooms && Memory.rooms[roomName] && Memory.rooms[roomName].avoid;
	}
	/**
     * check if a position is an exit
     * @param pos
     * @returns {boolean}
     */
	static isExit(pos) {
		return pos.x === 0 || pos.y === 0 || pos.x === 49 || pos.y === 49;
	}
	/**
     * check two coordinates match
     * @param pos1
     * @param pos2
     * @returns {boolean}
     */
	static sameCoord(pos1, pos2) {
		return pos1.x === pos2.x && pos1.y === pos2.y;
	}
	/**
     * check if two positions match
     * @param pos1
     * @param pos2
     * @returns {boolean}
     */
	static samePos(pos1, pos2) {
		return this.sameCoord(pos1, pos2) && pos1.roomName === pos2.roomName;
	}
	/**
     * draw a circle at position
     * @param pos
     * @param color
     * @param opacity
     */
	static circle(pos, color, opacity) {
		new RoomVisual(pos.roomName).circle(pos, {
			radius: 0.45,
			fill: 'transparent',
			stroke: color,
			strokeWidth: 0.15,
			opacity: opacity
		});
	}
	/**
     * update memory on whether a room should be avoided based on controller owner
     * @param room
     */
	static updateRoomStatus(room) {
		if (!room) {
			return;
		}
		if (room.controller) {
			if (room.controller.owner && !room.controller.my) {
				room.memory.avoid = 1;
			} else {
				delete room.memory.avoid;
			}
		}
	}
	/**
     * find a path from origin to destination
     * @param origin
     * @param destination
     * @param options
     * @returns {PathfinderReturn}
     */
	static findTravelPath(origin, destination, options = {}) {
		_.defaults(options, {
			ignoreCreeps: true,
			maxOps: DEFAULT_MAXOPS,
			range: 1
		});
		if (options.movingTarget) {
			options.range = 0;
		}
		origin = this.normalizePos(origin);
		destination = this.normalizePos(destination);
		let originRoomName = origin.roomName;
		let destRoomName = destination.roomName;
		let roomDistance = Game.map.getRoomLinearDistance(origin.roomName, destination.roomName);
		let allowedRooms = options.route;
		if (!allowedRooms && (options.useFindRoute || (options.useFindRoute === undefined && roomDistance > 2))) {
			let route = this.findRoute(origin.roomName, destination.roomName, options);
			if (route) {
				allowedRooms = route;
			}
		}
		let roomsSearched = 0;
		let callback = (roomName) => {
			if (allowedRooms) {
				if (!allowedRooms[roomName]) {
					return false;
				}
			} else if (
				!options.allowHostile &&
				Traveler.checkAvoid(roomName) &&
				roomName !== destRoomName &&
				roomName !== originRoomName
			) {
				return false;
			}
			roomsSearched++;
			let matrix;
			let room = Game.rooms[roomName];
			if (room) {
				if (options.ignoreStructures) {
					matrix = new PathFinder.CostMatrix();
					if (!options.ignoreCreeps) {
						Traveler.addCreepsToMatrix(room, matrix);
					}
				} else if (options.ignoreCreeps || roomName !== originRoomName) {
					matrix = this.getStructureMatrix(room, options.freshMatrix);
				} else {
					matrix = this.getCreepMatrix(room);
				}
				if (options.obstacles) {
					matrix = matrix.clone();
					for (let obstacle of options.obstacles) {
						if (obstacle.pos.roomName !== roomName) {
							continue;
						}
						matrix.set(obstacle.pos.x, obstacle.pos.y, 0xff);
					}
				}
			}
			if (options.roomCallback) {
				if (!matrix) {
					matrix = new PathFinder.CostMatrix();
				}
				let outcome = options.roomCallback(roomName, matrix.clone());
				if (outcome !== undefined) {
					return outcome;
				}
			}
			return matrix;
		};
		let ret = PathFinder.search(
			origin,
			{ pos: destination, range: options.range },
			{
				maxOps: options.maxOps,
				maxRooms: options.maxRooms,
				plainCost: options.offRoad ? 1 : options.ignoreRoads ? 1 : 2,
				swampCost: options.offRoad ? 1 : options.ignoreRoads ? 5 : 10,
				roomCallback: callback
			}
		);
		if (ret.incomplete && options.ensurePath) {
			if (options.useFindRoute === undefined) {
				if (roomDistance <= 2) {
					console.log(`TRAVELER: path failed without findroute, trying with options.useFindRoute = true`);
					console.log(`from: ${origin}, destination: ${destination}`);
					options.useFindRoute = true;
					ret = this.findTravelPath(origin, destination, options);
					console.log(`TRAVELER: second attempt was ${ret.incomplete ? 'not ' : ''}successful`);
					return ret;
				}
			} else {
			}
		}
		return ret;
	}
	/**
     * find a viable sequence of rooms that can be used to narrow down pathfinder's search algorithm
     * @param origin
     * @param destination
     * @param options
     * @returns {{}}
     */
	static findRoute(origin, destination, options = {}) {
		let restrictDistance = options.restrictDistance || Game.map.getRoomLinearDistance(origin, destination) + 10;
		let allowedRooms = { [origin]: true, [destination]: true };
		let highwayBias = 1;
		if (options.preferHighway) {
			highwayBias = 2.5;
			if (options.highwayBias) {
				highwayBias = options.highwayBias;
			}
		}
		let ret = Game.map.findRoute(origin, destination, {
			routeCallback: (roomName) => {
				if (options.routeCallback) {
					let outcome = options.routeCallback(roomName);
					if (outcome !== undefined) {
						return outcome;
					}
				}
				let rangeToRoom = Game.map.getRoomLinearDistance(origin, roomName);
				if (rangeToRoom > restrictDistance) {
					return Number.POSITIVE_INFINITY;
				}
				if (
					!options.allowHostile &&
					Traveler.checkAvoid(roomName) &&
					roomName !== destination &&
					roomName !== origin
				) {
					return Number.POSITIVE_INFINITY;
				}
				let parsed;
				if (options.preferHighway) {
					parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
					let isHighway = parsed[1] % 10 === 0 || parsed[2] % 10 === 0;
					if (isHighway) {
						return 1;
					}
				}
				if (!options.allowSK && !Game.rooms[roomName]) {
					if (!parsed) {
						parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
					}
					let fMod = parsed[1] % 10;
					let sMod = parsed[2] % 10;
					let isSK = !(fMod === 5 && sMod === 5) && (fMod >= 4 && fMod <= 6) && (sMod >= 4 && sMod <= 6);
					if (isSK) {
						return 10 * highwayBias;
					}
				}
				return highwayBias;
			}
		});
		if (!_.isArray(ret)) {
			console.log(`couldn't findRoute to ${destination}`);
			return;
		}
		for (let value of ret) {
			allowedRooms[value.room] = true;
		}
		return allowedRooms;
	}
	/**
     * check how many rooms were included in a route returned by findRoute
     * @param origin
     * @param destination
     * @returns {number}
     */
	static routeDistance(origin, destination) {
		let linearDistance = Game.map.getRoomLinearDistance(origin, destination);
		if (linearDistance >= 32) {
			return linearDistance;
		}
		let allowedRooms = this.findRoute(origin, destination);
		if (allowedRooms) {
			return Object.keys(allowedRooms).length;
		}
	}
	/**
     * build a cost matrix based on structures in the room. Will be cached for more than one tick. Requires vision.
     * @param room
     * @param freshMatrix
     * @returns {any}
     */
	static getStructureMatrix(room, freshMatrix) {
		if (!this.structureMatrixCache[room.name] || (freshMatrix && Game.time !== this.structureMatrixTick)) {
			this.structureMatrixTick = Game.time;
			let matrix = new PathFinder.CostMatrix();
			this.structureMatrixCache[room.name] = Traveler.addStructuresToMatrix(room, matrix, 1);
		}
		return this.structureMatrixCache[room.name];
	}
	/**
     * build a cost matrix based on creeps and structures in the room. Will be cached for one tick. Requires vision.
     * @param room
     * @returns {any}
     */
	static getCreepMatrix(room) {
		if (!this.creepMatrixCache[room.name] || Game.time !== this.creepMatrixTick) {
			this.creepMatrixTick = Game.time;
			this.creepMatrixCache[room.name] = Traveler.addCreepsToMatrix(
				room,
				this.getStructureMatrix(room, true).clone()
			);
		}
		return this.creepMatrixCache[room.name];
	}
	/**
     * add structures to matrix so that impassible structures can be avoided and roads given a lower cost
     * @param room
     * @param matrix
     * @param roadCost
     * @returns {CostMatrix}
     */
	static addStructuresToMatrix(room, matrix, roadCost) {
		let impassibleStructures = [];
		for (let structure of room.find(FIND_STRUCTURES)) {
			if (structure instanceof StructureRampart) {
				if (!structure.my && !structure.isPublic) {
					impassibleStructures.push(structure);
				}
			} else if (structure instanceof StructureRoad) {
				matrix.set(structure.pos.x, structure.pos.y, roadCost);
			} else if (structure instanceof StructureContainer) {
				matrix.set(structure.pos.x, structure.pos.y, 5);
			} else {
				impassibleStructures.push(structure);
			}
		}
		for (let site of room.find(FIND_MY_CONSTRUCTION_SITES)) {
			if (
				site.structureType === STRUCTURE_CONTAINER ||
				site.structureType === STRUCTURE_ROAD ||
				site.structureType === STRUCTURE_RAMPART
			) {
				continue;
			}
			matrix.set(site.pos.x, site.pos.y, 0xff);
		}
		for (let structure of impassibleStructures) {
			matrix.set(structure.pos.x, structure.pos.y, 0xff);
		}
		return matrix;
	}
	/**
     * add creeps to matrix so that they will be avoided by other creeps
     * @param room
     * @param matrix
     * @returns {CostMatrix}
     */
	static addCreepsToMatrix(room, matrix) {
		room.find(FIND_CREEPS).forEach((creep) => matrix.set(creep.pos.x, creep.pos.y, 0xff));
		return matrix;
	}
	/**
     * serialize a path, traveler style. Returns a string of directions.
     * @param startPos
     * @param path
     * @param color
     * @returns {string}
     */
	static serializePath(startPos, path, color = 'orange') {
		let serializedPath = '';
		let lastPosition = startPos;
		this.circle(startPos, color);
		for (let position of path) {
			if (position.roomName === lastPosition.roomName) {
				new RoomVisual(position.roomName).line(position, lastPosition, { color: color, lineStyle: 'dashed' });
				serializedPath += lastPosition.getDirectionTo(position);
			}
			lastPosition = position;
		}
		return serializedPath;
	}
	/**
     * returns a position at a direction relative to origin
     * @param origin
     * @param direction
     * @returns {RoomPosition}
     */
	static positionAtDirection(origin, direction) {
		let offsetX = [ 0, 0, 1, 1, 1, 0, -1, -1, -1 ];
		let offsetY = [ 0, -1, -1, 0, 1, 1, 1, 0, -1 ];
		let x = origin.x + offsetX[direction];
		let y = origin.y + offsetY[direction];
		if (x > 49 || x < 0 || y > 49 || y < 0) {
			return;
		}
		return new RoomPosition(x, y, origin.roomName);
	}
	/**
     * convert room avoidance memory from the old pattern to the one currently used
     * @param cleanup
     */
	static patchMemory(cleanup = false) {
		if (!Memory.empire) {
			return;
		}
		if (!Memory.empire.hostileRooms) {
			return;
		}
		let count = 0;
		for (let roomName in Memory.empire.hostileRooms) {
			if (Memory.empire.hostileRooms[roomName]) {
				if (!Memory.rooms[roomName]) {
					Memory.rooms[roomName] = {};
				}
				Memory.rooms[roomName].avoid = 1;
				count++;
			}
			if (cleanup) {
				delete Memory.empire.hostileRooms[roomName];
			}
		}
		if (cleanup) {
			delete Memory.empire.hostileRooms;
		}
		console.log(`TRAVELER: room avoidance data patched for ${count} rooms`);
	}
	static deserializeState(travelData, destination) {
		let state = {};
		if (travelData.state) {
			state.lastCoord = { x: travelData.state[STATE_PREV_X], y: travelData.state[STATE_PREV_Y] };
			state.cpu = travelData.state[STATE_CPU];
			state.stuckCount = travelData.state[STATE_STUCK];
			state.destination = new RoomPosition(
				travelData.state[STATE_DEST_X],
				travelData.state[STATE_DEST_Y],
				travelData.state[STATE_DEST_ROOMNAME]
			);
		} else {
			state.cpu = 0;
			state.destination = destination;
		}
		return state;
	}
	static serializeState(creep, destination, state, travelData) {
		travelData.state = [
			creep.pos.x,
			creep.pos.y,
			state.stuckCount,
			state.cpu,
			destination.x,
			destination.y,
			destination.roomName
		];
	}
	static isStuck(creep, state) {
		let stuck = false;
		if (state.lastCoord !== undefined) {
			if (this.sameCoord(creep.pos, state.lastCoord)) {
				stuck = true;
			} else if (this.isExit(creep.pos) && this.isExit(state.lastCoord)) {
				stuck = true;
			}
		}
		return stuck;
	}
}
Traveler.structureMatrixCache = {};
Traveler.creepMatrixCache = {};
exports.Traveler = Traveler;
const REPORT_CPU_THRESHOLD = 1000;
const DEFAULT_MAXOPS = 20000;
const DEFAULT_STUCK_VALUE = 2;
const STATE_PREV_X = 0;
const STATE_PREV_Y = 1;
const STATE_STUCK = 2;
const STATE_CPU = 3;
const STATE_DEST_X = 4;
const STATE_DEST_Y = 5;
const STATE_DEST_ROOMNAME = 6;
Creep.prototype.travelTo = function(destination, options) {
	return Traveler.travelTo(this, destination, options);
};

return module.exports;
}
/********** End of module 3: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\traveler.js **********/
/********** Start module 4: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\builder.js **********/
__modules[4] = function(module, exports) {
let prototypes = __require(11,4);

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
		let builderTarget = _.get(room.memory, [ 'census', 'builder' ], 1);

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
/********** End of module 4: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\builder.js **********/
/********** Start module 5: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\harvester.js **********/
__modules[5] = function(module, exports) {
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
/********** End of module 5: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\harvester.js **********/
/********** Start module 6: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\repairer.js **********/
__modules[6] = function(module, exports) {
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
			var closestDamagedStructure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
				filter: (structure) => structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL
			});

			if (closestDamagedStructure) {
				if (creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
					creep.moveTo(closestDamagedStructure);
				}
			}
		} else {
			creep.harvestEnergy();
		}
	},
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
	spawnData: function(room) {
		let name = 'Repairer' + Game.time;
		let body = Creep.getBody([ WORK, CARRY, MOVE ], room);
		let memory = { role: 'repairer', homeRoom: room.name };

		return { name, body, memory };
	}
};

module.exports = repairer;

return module.exports;
}
/********** End of module 6: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\repairer.js **********/
/********** Start module 7: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\upgrader.js **********/
__modules[7] = function(module, exports) {
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
				creep.travelTo(creep.room.controller);
			}
		} else {
			creep.harvestEnergy();
		}
	},
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
	spawnData: function(room) {
		let name = 'Upgrader' + Game.time;
		let body = Creep.getBody([ WORK, CARRY, MOVE ], room);
		let memory = { role: 'upgrader', homeRoom: room.name };

		return { name, body, memory };
	}
};

module.exports = upgrader;

return module.exports;
}
/********** End of module 7: C:\Users\walke\Documents\Coding\screeps code folder\src\creeps\upgrader.js **********/
/********** Start module 8: C:\Users\walke\Documents\Coding\screeps code folder\src\room\defense.js **********/
__modules[8] = function(module, exports) {
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
/********** End of module 8: C:\Users\walke\Documents\Coding\screeps code folder\src\room\defense.js **********/
/********** Start module 9: C:\Users\walke\Documents\Coding\screeps code folder\src\room\identify.js **********/
__modules[9] = function(module, exports) {
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
/********** End of module 9: C:\Users\walke\Documents\Coding\screeps code folder\src\room\identify.js **********/
/********** Start module 10: C:\Users\walke\Documents\Coding\screeps code folder\src\room\spawning.js **********/
__modules[10] = function(module, exports) {
let creepLogic = __require(1,10);
const { spawn } = __require(7,10);
let creepTypes = _.keys(creepLogic);

function spawnCreeps(room) {
	_.forEach(creepTypes, (type) => console.log(type));
	let creepTypeNeeded = _.find(creepTypes, function(type) {
		return creepLogic[type].spawn(room);
	});
	let creepSpawnData = creepLogic[creepTypeNeeded] && creepLogic[creepTypeNeeded].spawnData(room);

	if (creepSpawnData) {
		console.log(room, JSON.stringify(creepSpawnData));

		let spawns = room.find(FIND_MY_SPAWNS);
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

return module.exports;
}
/********** End of module 10: C:\Users\walke\Documents\Coding\screeps code folder\src\room\spawning.js **********/
/********** Start module 11: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\index.js **********/
__modules[11] = function(module, exports) {
let files = {
	creep: __require(12,11),
	roomPosition: __require(13,11)
};

module.exports = files;

return module.exports;
}
/********** End of module 11: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\index.js **********/
/********** Start module 12: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\creep.js **********/
__modules[12] = function(module, exports) {
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
/********** End of module 12: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\creep.js **********/
/********** Start module 13: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\roomPosition.js **********/
__modules[13] = function(module, exports) {
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
/********** End of module 13: C:\Users\walke\Documents\Coding\screeps code folder\src\prototypes\roomPosition.js **********/
/********** Footer **********/
if(typeof module === "object")
	module.exports = __require(0);
else
	return __require(0);
})();
/********** End of footer **********/
