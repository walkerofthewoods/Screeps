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
