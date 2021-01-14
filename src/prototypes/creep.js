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

	//how much each segment costs
	let segmentCost = _.sum(segment, (s) => BODYPART_COST[s]);

	// how much energy we can use total
	// energyCapacityAvailable formerly, makes big creeps but they don't sustain
	let energyAvailable = room.energyAvailable;

	// how many times we can include the segment with room energy
	let maxSegments = Math.floor(energyAvailable / segmentCost);

	// push the segment multiple times
	_.times(maxSegments, function() {
		_.forEach(segment, (s) => body.push(s));
	});
	console.log(body, maxSegments, energyAvailable, room);
	return body;
};
