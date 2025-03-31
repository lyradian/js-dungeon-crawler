function Dungeon() 
{
	
	const F = 0, HW = 1,  W = 2, R = 3, RW = 4; 
	this.code = {floor:F, halfWall:HW, wall:W, roof:R, roofWall:RW};
	this.map = [ [W, W,  W,  W,  W,  W,  W],
                [W, F, R, R, R, R, W],
                [W, F, W,  F, W,  F, W],
                [W, F, F, F, F, F, W],
                [W, F, W,  F, W,  F, W],
                [W, F, F, F, F, F, W],
                [W, W,  W,  W,  W,  W, W]];
	return this;
}

const dungeon = new Dungeon();
