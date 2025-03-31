function Dungeon() 
{
	const F=0, SF = 1,  HW = 2,  QW=3, W = 4, R = 5, RW = 6; 
	this.code = {floor:F, startingFloor: SF, halfWall:HW, quarterWall:QW, wall:W, roof:R, roofWall:RW};
	this.map = [];
	this.entityMap = [];
	this.entityTypes = [
		{ name: "Treasure", spawnMarkerPercent: 11, texture: soldierTexture, color: 0xffffff, interact: () => alert("You found treasure!") },
		{ name: "Key", spawnMarkerPercent: 22, texture: soldierTexture, color: 0xffffff, interact: () => alert("You found a key!") },
		{ name: "Enemy", spawnMarkerPercent: 95, texture: merchantTexture, color: 0xff3322, interact: () => alert("Enemy attacks!") },
	];
	
				
	this.GenerateMap = function( width=35, height=35, minWidth=3, minHeight=3) {
		this.map = Array(height).fill().map(() => Array(width).fill(W));
		this.entityMap = Array(height).fill().map(() => Array(width).fill(0));
		
        // Random room dimensions (minimum 3x3, leaving 1 wall border)
        const mapWidth = Math.floor(Math.random() * (width - minWidth-1)) + minWidth;
        const mapHeight = Math.floor(Math.random() * (height - minHeight -1)) + minHeight;
        
        // Random position (ensuring it fits within walls)
        const startX = Math.floor(Math.random() * (width - mapWidth - 2)) + 1;
        const startY = Math.floor(Math.random() * (height - mapHeight - 2)) + 1;
        
		let coveragePercent = 0;
		let	currentRoomIndex = 0;
		let entityIndex = 0;
		let entityMarkers = Object.keys(this.entityTypes);
		let maxRooms = mapWidth*mapHeight;
		
		const centerX = Math.floor(startX + mapWidth/2);
        const centerY = Math.floor(startY + mapHeight/2);
		
        // Carve out the room
        for (let y = startY; y < startY + mapHeight; y++) {
            for (let x = startX; x < startX + mapWidth; x++) {
                // Create floor
                this.map[y][x] = F;
                
				if (x > startX && x < startX + mapWidth - 1 && 
                    y > startY && y < startY + mapHeight - 1) 
				{
					if (Math.random() < 0.1) this.map[y][x] = HW;
					else if (Math.random() < 0.15) this.map[y][x] = HW;
					else if (Math.random() < 0.16) this.map[y][x] = R;
                }
				
				switch (this.map[y][x]) 
				{
					case R:
					case F:
						if (entityIndex < this.entityTypes.length) 
						{
							const currentEntity = this.entityTypes[entityIndex];
							if ( coveragePercent >= currentEntity.spawnMarkerPercent ) 
							{
								this.entityMap[y][x] = entityIndex;
								entityIndex ++;
							}
						}
						break;
				}
				
				currentRoomIndex++;
				coveragePercent = currentRoomIndex*100/maxRooms ;

            }
        };
		
        this.map[centerY][centerX] = SF;
        
        // Ensure walkable path by flood filling
        this.EnsureWalkablePath(centerX, centerY);
		this.LoadentityMap(width, height, minWidth, minHeight);
	
    };
		
	this.EnsureWalkablePath = function(startX, startY) {
        const visited = new Set();
        const toVisit = [{x: startX, y: startY}];
        const directions = [[0,1],[1,0],[0,-1],[-1,0]];
        
        while (toVisit.length > 0) {
            const current = toVisit.pop();
            visited.add(`${current.x},${current.y}`);
            
            for (const [dx, dy] of directions) {
                const nx = current.x + dx;
                const ny = current.y + dy;
                
                if (this.IsValidPosition(nx, ny) && 
                    !visited.has(`${nx},${ny}`) && 
                    (this.map[ny][nx] === F || this.map[ny][nx] === HW)) {
                    toVisit.push({x: nx, y: ny});
                }
            }
        }
        
        // Convert unreachable floors to walls
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[0].length; x++) {
                if ((this.map[y][x] === F || this.map[y][x] === HW) && 
                    !visited.has(`${x},${y}`)) {
                    this.map[y][x] = W;
                }
            }
        }
    };
    
    this.IsValidPosition = function(x, y) {
        return x >= 0 && y >= 0 && x < this.map[0]?.length && y < this.map.length;
    };
	
	this.CanMoveTo = function (x, y) {
		if (this.IsValidPosition(x, y)) {
			switch (this.map[y][x]) 
			{
				case SF:
				case F:
				case R:
					return true;
				break;
			}
		}
		return false;
	};
	
	this.GetStartingPosition = function () {
		for (let y = 0; y<this.map.length; y++) {
			for (let x = 0; x<this.map[0].length;x++) {
				if (this.map[y][x]==SF) 
					return {x: x, y:y};
			}
		}
		return {x:0, y:0};
	};
	
	this.LoadentityMap = function( width, height, mapWidth, mapHeight) 
	{
		for (let key in this.entityTypes) {
			const x = Math.floor(Math.random() * (width - mapWidth - 2)) + 1;
			const y = Math.floor(Math.random() * (height - mapHeight - 2)) + 1;
			let attempt = 0;
			while (this.IsValidPosition(x, y) && attempt < 1000) {
				this.entityMap[y][x] = key;
				attempt ++;
			}
		}
	};
	
	this.GenerateMap();
//	this.LoadentityMap();
	
	return this;
}

const dungeon = new Dungeon();
