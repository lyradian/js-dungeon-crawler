function MiniMap (canvasDomID='miniMap', arrowDomID='playerArrow', cellSize=32, viewportTiles=8)
{
	this.canvasDomID = canvasDomID;
    this.arrowDomID = arrowDomID;
    this.canvas = document.getElementById(canvasDomID);
    this.ctx = this.canvas.getContext('2d');
    this.cellSize = cellSize;
    this.viewportTiles = viewportTiles;
    this.viewportSize = viewportTiles * cellSize;
    
    // Set fixed canvas size for viewport
    this.canvas.width = this.viewportSize;
    this.canvas.height = this.viewportSize;
    
    this.colors = {
        floor: '#444444',
        startingFloor: '#00ff00',
        wall: '#888888',
        halfWall: '#666666',
        roof: '#333333',
        player: '#ff0000',
        entities: ['#ffff00', '#0000ff', '#ff3333'] // Treasure, Key, Enemy
    };
    
    // Calculate viewport boundaries
    this.GetViewportBounds = function(playerX, playerY) 
	{
		const halfView = Math.floor(this.viewportTiles / 2);
		let minX = playerX - halfView;
		let maxX = playerX + halfView;
		let minY = playerY - halfView;
		let maxY = playerY + halfView;
		return { minX, maxX, minY, maxY };
	};
    
    this.RenderDungeon = function(dungeon) {
        const ctx = this.ctx;
        const map = dungeon.map;
        const entityMap = dungeon.entityMap;
        
        // Clear the canvas
        ctx.clearRect(0, 0, this.viewportSize, this.viewportSize);
        
        const bounds = this.GetViewportBounds(state.position.x, state.position.y);
        const offsetX = (this.viewportTiles - (bounds.maxX - bounds.minX + 1)) / 2;
        const offsetY = (this.viewportTiles - (bounds.maxY - bounds.minY + 1)) / 2;
        
        // Draw visible portion of the map
        for (let y = bounds.minY; y <= bounds.maxY; y++) 
		{
            for (let x = bounds.minX; x <= bounds.maxX; x++) 
			{
                const cellX = (x - bounds.minX + offsetX) * this.cellSize;
                const cellY = (y - bounds.minY + offsetY) * this.cellSize;
                
				switch(map?.[y]?.[x]) 
				{
					case dungeon.code.floor: ctx.fillStyle = this.colors.floor; break;
					case dungeon.code.startingFloor: ctx.fillStyle = this.colors.startingFloor; break;
					case dungeon.code.wall: ctx.fillStyle = this.colors.wall; break;
					case dungeon.code.halfWall: ctx.fillStyle = this.colors.halfWall; break;
					case dungeon.code.roof: ctx.fillStyle = this.colors.roof; break;
					default: ctx.fillStyle = '#000000';
				}                
				ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
			
                
                // Draw entities as circles
                if (entityMap?.[y]?.[x] >= 0) 
				{
                    const entityColor = this.colors.entities[entityMap[y][x]] || '#ffffff';
                    ctx.fillStyle = entityColor;
                    ctx.beginPath();
                    ctx.arc( cellX + this.cellSize/2, cellY + this.cellSize/2, this.cellSize/3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Draw player in center
        this.DrawPlayerIcon();
    };
    
    this.DrawPlayerIcon = function() 
	{
        const ctx = this.ctx;
        const centerX = this.viewportSize / 2;
        const centerY = this.viewportSize / 2;
        const size = this.cellSize * 0.8;
        
        ctx.fillStyle = this.colors.player;
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Rotate based on facing direction
		let face = (8-state.facing)%4;
        const angle = (face * Math.PI / 2 ); // Convert to radians
        ctx.rotate(angle);
        
        // Draw triangle pointing up (will be rotated to correct direction)
        ctx.beginPath();
        ctx.moveTo(0, -size/2); // Point
        ctx.lineTo(size/2, size/2); // Bottom right
        ctx.lineTo(-size/2, size/2); // Bottom left
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    };
	return this;
};
