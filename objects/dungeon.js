function Dungeon() 
{
	const F=0, SF = 1,  HW = 2,  QW=3, W = 4, R = 5, RW = 6; 
	this.code = {floor:F, startingFloor: SF, halfWall:HW, quarterWall:QW, wall:W, roof:R, roofWall:RW};
	this.walls = [];
	this.floors = [];
	this.ceilings = [];
	this.entities = [];
	this.map = [];
	this.entityMap = [];
	this.entityTypes = [];
	this.areaSettings;
	
	this.GenerateLayout = function( areaSettings, width=35, height=35, minWidth=3, minHeight=3) {
		this.areaSettings = areaSettings;
		this.entityTypes = areaSettings.entities;
		this.map = Array(height).fill().map(() => Array(width).fill(W));
		this.entityMap = Array(height).fill().map(() => Array(width).fill(-1));
		
        const mapWidth = Math.floor(Math.random() * (width - minWidth-1)) + minWidth; // Random room dimensions (minimum 3x3, leaving 1 wall border)
        
        const mapHeight = Math.floor(Math.random() * (height - minHeight -1)) + minHeight;
        
        const startX = Math.floor(Math.random() * (width - mapWidth - 2)) + 1;
        const startY = Math.floor(Math.random() * (height - mapHeight - 2)) + 1;
        
		let coveragePercent = 0;
		let	currentRoomIndex = 0;
		let entityIndex = 0;
		let maxRooms = mapWidth*mapHeight;
		
		const centerX = Math.floor(startX + mapWidth/2);
        const centerY = Math.floor(startY + mapHeight/2);
		
        for (let y = startY; y < startY + mapHeight; y++) {
            for (let x = startX; x < startX + mapWidth; x++) {
                this.map[y][x] = F;
                
				if (x > startX && x < startX + mapWidth - 1 && 
                    y > startY && y < startY + mapHeight - 1) 
				{
					if (Math.random() < 0.1) this.map[y][x] = HW;
					else if (Math.random() < 0.15) this.map[y][x] = HW;
					else if (Math.random() < 0.16) this.map[y][x] = R;
					
					switch (this.map[y][x]) 
					{
						case R:
						case F:
							if (entityIndex < areaSettings.entities.length) 
							{
								const currentEntity = areaSettings.entities[entityIndex];
								if ( coveragePercent >= currentEntity.areaPercentPosition ) 
								{
									this.entityMap[y][x] = entityIndex;
									entityIndex ++;
								}
								
							}
							break;
					}
                }
				
				currentRoomIndex++;
				coveragePercent = currentRoomIndex*100/maxRooms ;
            }
        };
		
        this.map[centerY][centerX] = SF;
        this.EnsureWalkablePath(centerX, centerY);
		this.Render();
	
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
	
	this.Clear = function () {
		this.walls.forEach(wall => scene.remove(wall));
		this.entities.forEach(entity => scene.remove(entity));
		this.ceilings.forEach(ceiling=>scene.remove(ceiling));
		this.floors.forEach(floor=>scene.remove(floor));
		this.walls = [];
		this.entities = [];
		this.ceilings = [];
		this.floors = [];
	};
	
	this.Render = function () 
	{
		this.Clear();
		// Materials
		const textureLoader = new THREE.TextureLoader();
		const wallMaterial = new THREE.MeshStandardMaterial({
			map: new THREE.TextureLoader().load(this.areaSettings.wallTexture),
			roughness: 0.8
		});
		const floorMaterial = new THREE.MeshStandardMaterial({
			map: new THREE.TextureLoader().load(this.areaSettings.groundTexture),
			roughness: 0.8
		});
		const ceilingMaterial = new THREE.MeshStandardMaterial({
			map: new THREE.TextureLoader().load(this.areaSettings.wallTexture),
			roughness: 0.3
		});
		
		const skyBackground = new THREE.TextureLoader().load(this.areaSettings.skyTexture);
		skyBackground.mapping = THREE.EquirectangularReflectionMapping;
		scene.background = skyBackground;
		
		

		// Create floor and ceiling
		const floorGeometry = new THREE.PlaneGeometry(1, 1);
		const ceiling = new THREE.Mesh(floorGeometry, ceilingMaterial);
		
		
		// Create Walls
		const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
		const halfWallGeometry = new THREE.BoxGeometry(1, 0.333, 1);
		const ceilingGeometry = new THREE.BoxGeometry(1, 0.05, 1);
		
		for (let y = 0; y < this.map.length; y++) 
		{
			for (let x = 0; x < this.map[y].length; x++) 
			{
				this.SpawnFloor(x,y, floorMaterial, floorGeometry);
				//SpawnCeiling(x,y,ceilingMaterial, ceilingGeometry);
				this.SpawnWall(x,y, wallMaterial, wallGeometry);
				this.SpawnHalfWall(x,y, wallMaterial, halfWallGeometry);
				this.SpawnEntity(x,y);
			}
		}
		
		// Ambience and Lighting
		scene.fog.color.set(this.areaSettings.fogColor);
		renderer.setClearColor(this.areaSettings.fogColor);
		scene.children.forEach(child => {
			if (child.isMesh) {
				if (child.position.y < 0) {
					// Floor
					child.material.color.set(this.areaSettings.floorColor);
				} else if (child.position.y > 1) {
					// Ceiling
					child.material.color.set(this.areaSettings.ceilingColor);
				} else {
					// Wall or entity
					const userData = child.userData;
					if (userData && userData.type === 'entity' && userData.id) {
						child.material.color.set(this.areaSettings.entityColors[userData.id] || 0xffffff);
						child.material.emissive.set(this.areaSettings.entityColors[userData.id] || 0xffffff);
					} else {
						child.material.color.set(this.areaSettings.wallColor);
					}
				}
			} else if (child.isLight && child.type === 'AmbientLight') {
				child.color.set(this.areaSettings.ambientLight);
			}
		});
	};
	
	this.SpawnFloor = function (x,y,material, geometry) 
	{
		const floor = new THREE.Mesh(geometry, material);
		floor.rotation.x = -Math.PI / 2;
		floor.position.set(x, -0.01, y);
		scene.add(floor);
		this.floors.push(floor);
	};
		
	this.SpawnWall = function (x,y, material, geometry) 
	{
		if (this.map[y][x] === this.code.wall) {
			const wall = new THREE.Mesh(geometry, material);
			wall.position.set(x, 0.5, y);
			scene.add(wall);
			this.walls.push(wall);
		}
	};
		
	this.SpawnHalfWall = function (x,y, material, geometry) 
	{
		if (this.map[y][x] === this.code.halfWall) {
			const wall = new THREE.Mesh(geometry, material);
			wall.position.set(x, 0.167, y);
			scene.add(wall);
			this.walls.push(wall);
		}
	};
		
	this.SpawnCeiling =	function (x,y,material, geometry) 
	{
		if (this.map[y][x] === this.code.roof || this.map[y][x] === this.code.roofWall) {
			const ceiling = new THREE.Mesh(geometry, material);
			ceiling.position.set(x, 1, y);
			scene.add(ceiling);
			this.ceilings.push(ceiling);
		}
	};
		
		
	this.SpawnEntity = function (x,y) 
	{
		if ( this.entityMap?.[y]?.[x]  >= 0) 
		{        
			const entityId = this.entityMap[y][x];
			const entityType = this.entityTypes[entityId];
			
			if (entityType) 
			{
				const map = new THREE.TextureLoader().load(entityType.texture);
				map.transparent = true;
				
				const entityMaterial = new THREE.SpriteMaterial({
					map: map,
					transparent: true,
					alphaTest: 0.5, // Reduces transparency artifacts
					color: entityType.color || 0xffffff
				});
				
				// Create sprite
				const entity = new THREE.Sprite(entityMaterial);
				entity.position.set(x, 0.43, y);
				entity.scale.set(1, 1, 1); // Width, height
				
				entity.userData = { 
					type: 'entity', 
					id: entityId,
					interact: entityType.interact
				};
				scene.add(entity);
				this.entities.push(entity);
			}
		}
	};
	
	return this;
}

const dungeon = new Dungeon();
