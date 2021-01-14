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