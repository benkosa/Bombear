var express = require('express');
var app = express();
var serv = require('http').Server(app);

 
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
 
serv.listen(process.env.PORT);
console.log("Server started.");

              //////   LIST   \\\\\\
var SOCKET_LIST = {};

var freeSlot = {};

var mapList = [];

var DEBUG = true;

var zmena = false;

var Entity = function(param){
	var self = {
		x: param.x, 
		y: param.y, 
		blockX: param.blockX, 
		blockY: param.blockY, 
	}
	if(param.id)
	    self.id = param.id;
	if(param.type)
	    self.type = param.type;
	if(param.img)
	    self.img = param.img;
	if(param.owner)
	    self.owner = param.owner;
	 
	return self;
};

var Player = function(param){
    //(id, x, y, blockX, blockY, img){
    var self = Entity(param);
        if(param.slot)
            self.slot = param.slot;
        if(param.map)
            self.map = param.map;
        self.spd = 3;
        self.sirka = 43;
        self.vyska = 43;
        
        self.stun = false;
        self.dead = false;
        self.immortality = false;
        self.immortality_timer = 30;
        
        self.pocetBomb = 1;
        self.scoreBomb = self.pocetBomb;
        self.power = 1;
        self.collision = false;
        self.hp = 2;
        self.antiStun = false;
        
        
    	self.pressingRight = false;
    	self.pressingLeft = false;
    	self.pressingUp = false;
    	self.pressingDown = false;
    	self.pressingSpace = false;
    	

    self.otestujeKoliziu = {
        Block: function(block){
        if(block.collision){
            return testCollision.entity(self, block);
        }   
    },
        Bomb: function(block){
        if(block.bomb){
            return testCollision.entity(self, block);
        }   
    },
        Item: function(block){
        if(block.item != 'none'){
            block.sirka = 15;
            block.vyska = 15;
            return testCollision.entity(self, block);
        }   
    }
    };
    
    self.randomImg = function(){
        do var img = Math.floor(Math.random() * 10);
        while(mapList[self.map].setings.imgSlot[img] == 'full');
        mapList[self.map].setings.imgSlot[img] = 'full';
        return img;
    }
    	
    self.defaultPosition = function(){
    	    switch(self.slot){
    	        case 1: 
    	            self.x = Block.list.setings.spawnPoint[1].x;
    	            self.y = Block.list.setings.spawnPoint[1].y;
    	            break;
    	        case 2: 
                    self.x = Block.list.setings.spawnPoint[2].x;
                    self.y = Block.list.setings.spawnPoint[2].y;
    	            break;    	           
    	        case 3: 
                    self.x = Block.list.setings.spawnPoint[3].x;
                    self.y = Block.list.setings.spawnPoint[3].y;    	            
    	            break;
    	        case 4: 
                    self.x = Block.list.setings.spawnPoint[4].x;
                    self.y = Block.list.setings.spawnPoint[4].y;   	            
    	            break;
    	    }
    	};
    	
    self.aktualizujeVlastnostiHraca = function(block){
        switch(block.item){
        	case 'speed':
        		self.spd+= 0.5;
        		break;
        	case 'power':
        		self.power+= 1;
        		break;
        	case 'bomb':
        		self.pocetBomb+= 1;
        		self.scoreBomb+= 1;
        		break;
        	case 'hp':
        		self.hp+= 1;
        		break;
        	case 'stun':
        		self.antiStun = true;
        		break;
        }
        
        if(self.pocetBomb > 6) self.pocetBomb = 6;
        if(self.scoreBomb > 6) self.scoreBomb = 6;
        if(self.power > 4) self.power = 4; 
        if(self.spd > 7) self.spd = 7;
        
        var statPack = [];
        statPack.push({
            id:self.id,
            hp:self.hp,
            spd:self.spd,
            pocetBomb:self.scoreBomb,
            power:self.power,
            x: block.blockX,
            y: block.blockY,
            antiStun: self.antiStun
        });
        for(var i in Player.list[self.map]){
            var socket = SOCKET_LIST[i];
                socket.emit('statsUpdate',statPack);
        }
        
    }

    self.updatePosition = function(map){
        self.sirka = 43 - self.spd;
        self.vyska = 43 - self.spd;
       
        if(self.pressingRight){             
                if(self.stun == false)self.x += self.spd;
           
            for(var i = -1; i <= 1; i++){
                if (self.otestujeKoliziu.Block(mapList[map][self.blockX + 1][self.blockY+i])){
                    if(mapList[map][self.blockX + 1][self.blockY].type == 'air'){
                        if(self.y < mapList[map][self.blockX + 1][self.blockY].y){
                            self.y += self.spd;
                            self.x -= self.spd;
                        }
                        if(self.y > mapList[map][self.blockX + 1][self.blockY].y){
                            self.y -= self.spd;
                            self.x -= self.spd;
                        }
                    }else self.x -= self.spd;
                }
                if (mapList[self.map][self.blockX + 1][self.blockY+i].bomb
                && self.otestujeKoliziu.Bomb(mapList[self.map][self.blockX + 1][self.blockY+i], self))
                    self.x -= self.spd;
                if (mapList[self.map][self.blockX + 1][self.blockY+i].item != 'none'
                && self.otestujeKoliziu.Item(mapList[self.map][self.blockX + 1][self.blockY+i], self)){
                    self.aktualizujeVlastnostiHraca(mapList[self.map][self.blockX + 1][self.blockY+i]);
                    mapList[self.map][self.blockX + 1][self.blockY+i].item = 'none';
                }
            }           
        }
    	 
        if(self.pressingLeft){            
                if(self.stun == false)self.x -= self.spd;
           
            for(var i = -1; i <= 1; i++){
                if (self.otestujeKoliziu.Block(mapList[map][self.blockX - 1][self.blockY+i])){
                    if(mapList[map][self.blockX - 1][self.blockY].type == 'air'){
                        if(self.y < mapList[map][self.blockX - 1][self.blockY].y){
                            self.y += self.spd;
                            self.x += self.spd;
                        }
                        if(self.y > mapList[map][self.blockX - 1][self.blockY].y){
                            self.y -= self.spd;
                            self.x += self.spd;
                        }
                    }else self.x += self.spd;   
                }
                if (mapList[self.map][self.blockX - 1][self.blockY+i].bomb
                && self.otestujeKoliziu.Bomb(mapList[self.map][self.blockX - 1][self.blockY+i], self))
                    self.x += self.spd;
                if (mapList[self.map][self.blockX - 1][self.blockY+i].item != 'none'
                && self.otestujeKoliziu.Item(mapList[self.map][self.blockX - 1][self.blockY+i], self)){
                    self.aktualizujeVlastnostiHraca(mapList[self.map][self.blockX - 1][self.blockY+i]);
                    mapList[self.map][self.blockX - 1][self.blockY+i].item = 'none'
                }
                
            }             
        }
    	 
        if(self.pressingDown){       
                if(self.stun == false)self.y += self.spd;
            
            for(var i = -1; i <= 1; i++){
                if (self.otestujeKoliziu.Block(mapList[map][self.blockX - i][self.blockY + 1])){
                    if(mapList[map][self.blockX][self.blockY + 1].type == 'air'){
                        if(self.x < mapList[map][self.blockX][self.blockY - 1].x){
                            self.x += self.spd;
                            self.y -= self.spd;
                        }
                        if(self.x > mapList[map][self.blockX][self.blockY - 1].x){
                            self.x -= self.spd;
                            self.y -= self.spd;
                        }
                    }else self.y -= self.spd;      
                }
                if (mapList[self.map][self.blockX - i][self.blockY + 1].bomb
                && self.otestujeKoliziu.Bomb(mapList[self.map][self.blockX - i][self.blockY + 1], self))
                    self.y -= self.spd;
                if (mapList[self.map][self.blockX - i][self.blockY + 1].item != 'none'
                && self.otestujeKoliziu.Item(mapList[self.map][self.blockX - i][self.blockY + 1], self)){
                    self.aktualizujeVlastnostiHraca(mapList[self.map][self.blockX - i][self.blockY + 1]);
                    mapList[self.map][self.blockX - i][self.blockY + 1].item = 'none';
                }
            }               
        }
    	 
        if(self.pressingUp){             
                if(self.stun == false)self.y -= self.spd;
           
           for(var i = -1; i <= 1; i++){
                if (self.otestujeKoliziu.Block(mapList[map][self.blockX - i][self.blockY - 1])){
                    if(mapList[map][self.blockX][self.blockY - 1].type == 'air'){
                        if(self.x < mapList[map][self.blockX][self.blockY + 1].x){
                            self.x += self.spd;
                            self.y += self.spd;
                        }
                        if(self.x > mapList[map][self.blockX][self.blockY + 1].x){
                            self.x -= self.spd;
                            self.y += self.spd;
                        }
                    }else self.y += self.spd;    
                }
                if (mapList[self.map][self.blockX - i][self.blockY - 1].bomb
                && self.otestujeKoliziu.Bomb(mapList[self.map][self.blockX - i][self.blockY - 1], self))
                    self.y += self.spd;
               if (mapList[self.map][self.blockX - i][self.blockY - 1].item != 'none'
                && self.otestujeKoliziu.Item(mapList[self.map][self.blockX - i][self.blockY - 1], self)){
                    self.aktualizujeVlastnostiHraca(mapList[self.map][self.blockX - i][self.blockY - 1]);
                    mapList[self.map][self.blockX - i][self.blockY - 1].item = 'none';
                }
            }              
        }
    }
    
    self.aktualizjePoziciuBlockXY = function(){
        var count = -1;
        for(var i = 0; i <= 800; i += 50){
            count++;
            if(self.x < i && self.x > i-50){
                self.blockX = count;       
            }
            
            if(self.y < i && self.y > i-50){
                self.blockY = count;       
            }
        }
    }

    self.generateBomb = function(){
            if(self.pocetBomb > 0 
            && self.pressingSpace
            && mapList[self.map][self.blockX][self.blockY].bomb == false){
                self.pocetBomb--;
                var bombId = Math.random();
                
                //Bomb.list[self.map][self.blockX] = new Array();
                Bomb.list[self.map][bombId] = Bomb({
                    blockX: self.blockX,
                    blockY: self.blockY,
                    id: bombId,
                    owner: self.id
                });
                mapList[self.map][self.blockX][self.blockY].bomb = true;
                mapList[self.map][self.blockX][self.blockY].bombId = bombId;
                
                for(var i in Player.list[self.map]){
                    SOCKET_LIST[i].emit('generateBomb',{
                        id: bombId,
                        blockX: self.blockX,
                        blockY: self.blockY,
                        power: self.power
                    });
                }
                
                self.pressingSpace = false;
                //self.pocetBomb --;
            }
        }  
        
    self.img = self.randomImg();
    
    return self;
};
Player.list = {};

var Block = function(param){
    var self = Entity(param);
        self.sirka = 50;
        self.vyska = 50;
        self.collision = false;
        self.bomb = false;
        self.explosion = false;
        self.item = 'none';
        self.explosionTimer = 20;

    self.randomlyGenerateItem = function(){
        var random = Math.random() * 100;
        var x = self.blockX;
        var y = self.blockY;
        switch (true){
             case (random < 76):
                break;
            case (random < 77):
                self.item = 'stun';
                for(var i in Player.list[self.map])
                    SOCKET_LIST[i].emit('newItem',{
                        type: 'stun',
                        blockX: x,
                        blockY: y,
                        id: Player.list[self.map][i].blockX,
                    });
                break;
            case (random < 80):
                self.item = 'hp';
                for(var i in Player.list[self.map])
                    SOCKET_LIST[i].emit('newItem',{
                        type: 'hp',
                        blockX: x,
                        blockY: y,
                    });
                break;
            case (random < 90):
                self.item = 'speed';
                for(var i in Player.list[self.map])
                    SOCKET_LIST[i].emit('newItem',{
                        type: 'speed',
                        blockX: x,
                        blockY: y,
                    });
                break;
            case (random < 95):
                self.item = 'power';
                for(var i in Player.list[self.map])
                    SOCKET_LIST[i].emit('newItem',{
                        type: 'power',
                        blockX: x,
                        blockY: y,
                    });
                break;
            case (random < 100):
                self.item = 'bomb';
                for(var i in Player.list[self.map])
                    SOCKET_LIST[i].emit('newItem',{
                        type: 'bomb',
                        blockX: x,
                        blockY: y,
                    });
                break;
        }
        
    };
    
    self.exploziaDoStrany = function(countX, countY, owner){
        self.explosion = true;
        self.explosionOwner = Player.list[self.map][owner].name
        self.explosionTimer = 20;
            //centrum explozie
        if(self.bomb)
            Bomb.list[self.map][self.bombId].timer =0; 
                //ak najde bombu tak spusti vybuch
        if(self.type == 'dirt'){ //ak najde dirt tak zmeni block na air a vrati true
            self.changeBlock('air');
            self.randomlyGenerateItem();
            zmena = true;
            return true;
        }
        if(self.type == 'wall'){//ak najde wall tak vrati tru a zmaze poslednu exploziu
            self.explosion = false;
            zmena = 'wall';
            return true;
        } 
        if(countY*-1 == Player.list[self.map][Bomb.list[self.map][mapList[self.map][self.blockX-countX][self.blockY-countY].bombId].owner].power){
            zmena = 'air';
            return true;
        };
        if(countY == Player.list[self.map][Bomb.list[self.map][mapList[self.map][self.blockX-countX][self.blockY-countY].bombId].owner].power){
            zmena = 'air';
            return true;
        };
        if(countX*-1 == Player.list[self.map][Bomb.list[self.map][mapList[self.map][self.blockX-countX][self.blockY-countY].bombId].owner].power){
            zmena = 'air';
            return true;
        };
        if(countX == Player.list[self.map][Bomb.list[self.map][mapList[self.map][self.blockX-countX][self.blockY-countY].bombId].owner].power){
            zmena = 'air';
            return true;
        };
    }
    
    self.changeBlock = function(type){
        if(type)
            self.type = type;
        switch (self.type) {
            case 'air':
                self.img = 'air';
                self.collision = false;
                break;
            case 'dirt':
                self.img = 'dirt';
                self.collision = true;
                break;
            case 'wall':
                self.img = 'wall';
                self.collision = true;
                break;
        }
    }
    
    return self;
};
Block.list = {
    setings: {
        spawnPoint: new Array()
    }
};

var Bomb = function(param){
    var self = Entity(param);
        self.x = self.blockX * 50 - 25;
        self.y = self.blockY * 50 - 25;
        self.sirka = 50;
        self.vyska = 50;
        self.collision = true;
        self.timer = 74;
    return self;
}
Bomb.list = {};

var Disconnect = function(param){
    var self = {};
    self.id = param.id;
    self.timer = 75;
    self.map = param.map;
    
    Disconnect.list[self.map][self.id] = self;
    return self;
};
Disconnect.list = {};



              //////   GLOBAL FUNCTION   \\\\\\ 

var testCollision = {
    entity: function (entity1,entity2){	//return if colliding (true/false)
        //entity1 == player
        //entity2 == block
        var rect1 = {
            x:entity1.x-entity1.sirka/2,
            y:entity1.y-entity1.vyska/2,
            sirka:entity1.sirka,
            vyska:entity1.vyska,
        }
        var rect2 = {
            x:entity2.x-entity2.sirka/2,
            y:entity2.y-entity2.vyska/2,
            sirka:entity2.sirka,
            vyska:entity2.vyska,
        }
        return testCollision.RectRect(rect1,rect2);
    },
    RectRect: function(rect1,rect2){
    return rect1.x <= rect2.x + rect2.sirka 
        && rect2.x <= rect1.x + rect1.sirka
        && rect1.y <= rect2.y + rect2.vyska 
        && rect2.y <= rect1.y + rect1.vyska;
    }
};

var message = {
    lobby: function(self, map){
        self.setings.timer--;
        for(var a in Player.list[map])
            SOCKET_LIST[a].emit('writeToLobby',{time: self.setings.timer});
        if(self.setings.timer <= 0){
            message.server(map, '<font color="#FFD700"> Lobby was closed </font>');
            self.setings.state = 'lobbyClosed';
            self.setings.movement = false;   
        }    
    },
    closedLobby: function(self, map){
        for(var key in Player.list[map])
            stopPlayerMovement(Player.list[map][key]);
        
        switch (--self.setings.closedTimer){
            case 3:
                delete freeSlot[map];
                message.server(map, '<font color="#FFD700"> Game starts in </font>' + '<font color="#FFD700">' + self.setings.closedTimer + '</font>' + '<font color="#FFD700"> second</font>');
                
                nacitaBlockList('dirt');
                
                choseMap(4);
                
                //nacita blocky do mapList
                for(var x = 1; x <= 16; x++){
                    for(var y = 1; y <= 16; y++){
                        self[x][y] = Block.list[x][y];
                        self[x][y].map = map;
                        self[x][y].changeBlock();
                    }
                }
                
                //nastavy spawnpoint
                setSpawnPoint(self.setings, Block.list.setings);
                
                //odosiela info o mape klientovi
                var mapPack = [];    
                var idX =  -1;
                var idY =  0;
                for(var x = 0; x < 800; x += 50){
                    idX++;
                    mapPack.push([]);
                    for(var y = 0; y < 800; y += 50){
                        idY++;
                        mapPack[idX].push(Block.list[idX+1][idY]);
                    }
                    idY = 0;            
                }
                for(var key in Player.list[map]){
                    SOCKET_LIST[key].emit('loadMap',{mapPack, 
                        background: Block.list.setings.background,
                        name: Block.list.setings.mapName
                        
                    });
                    Player.list[map][key].defaultPosition();
                            
                }
            
                break;
            case 2:
                message.server(map, '<font color="#FFD700"> Game start at </font>' + '<font color="#FFD700">' + self.setings.closedTimer + '</font>' + '<font color="#FFD700"> second</font>');
                break;
            case 1:
                message.server(map, '<font color="#FFD700"> Game start at </font>' + '<font color="#FFD700">' + self.setings.closedTimer + '</font>' + '<font color="#FFD700"> second</font>');
                break;
            case 0:
                message.server(map, '<font color="#FFD700"> Game started! </font>');
                self.setings.state = 'inGame';
                self.setings.movement = true;
                self.setings.attack = true;
                break;
        }
    },
    server: function(map, text){
        for(var i in Player.list[map])
            SOCKET_LIST[i].emit('addToChat',text);
    },
    global: function(text){
        for(var map in Player.list)
            for(var i in Player.list[map])
                SOCKET_LIST[i].emit('addToChat',text);
    },
    winner: function(map){
        var i, b = 0;
            for(var id in Player.list[map]){
                if(Player.list[map][id])i++;
                if(!Player.list[map][id].dead)b++;
            }
        
        if(i == 1){
            for(var id in Player.list[map])
                var player = Player.list[map][id];
            message.global(player.name + ' is winner on map ' + mapList[map].setings.mapName);
            SOCKET_LIST[player.id].emit('Winner');
        }else if(b == 1){
            for(var id in Player.list[map])
                if(!Player.list[map][id].dead)player = Player.list[map][id];
            message.global(player.name + ' is winner on map ' + mapList[map].setings.mapName);
            SOCKET_LIST[player.id].emit('Winner');
        }
        
    },
    say: function(text){
    text = text.slice(3);
    for(var map in Player.list)
        for(var i in Player.list[map])
            SOCKET_LIST[i].emit('addToChat', '<font color="#cc3300">[SERVER]: </font>' + text);
}
    
};

var Map = {
    darkFores: function(){
        Block.list.setings.background = "#FCF9CC";
        Block.list.setings.mapName = 'Dark Forest';
        
        Block.list.setings.spawnPoint[1] = {
            x:125,
            y:125
        };
        Block.list.setings.spawnPoint[2] = {
            x:675,
            y:125
        };
        Block.list.setings.spawnPoint[3] = {
            x:125,
            y:675
        };
        Block.list.setings.spawnPoint[4] = {
            x:675,
            y:675
        };
        for(var i = 1; i<= 16;i++){
            Block.list[i][1].type = 'wall';
            Block.list[1][i].type = 'wall';
            Block.list[i][16].type = 'wall';
            Block.list[16][i].type = 'wall';      
        }
        Block.list[3][3].type = 'air';
        Block.list[3][2].type = 'air';            
        Block.list[2][3].type = 'air';
        Block.list[2][4].type = 'air';
        Block.list[4][2].type = 'air';
        
        Block.list[14][14].type = 'air';
        Block.list[15][14].type = 'air';            
        Block.list[14][15].type = 'air';
        Block.list[13][15].type = 'air';
        Block.list[15][13].type = 'air';
        
        Block.list[14][3].type = 'air';
        Block.list[14][2].type = 'air';            
        Block.list[15][3].type = 'air';
        Block.list[13][2].type = 'air';
        Block.list[15][4].type = 'air';
        
        Block.list[2][13].type = 'air';
        Block.list[2][14].type = 'air';            
        Block.list[3][14].type = 'air';
        Block.list[3][15].type = 'air';
        Block.list[4][15].type = 'air';
        
        Block.list[2][2].type = 'wall';
        Block.list[2][15].type = 'wall';  
        Block.list[15][2].type = 'wall';
        Block.list[15][15].type = 'wall';
        //
        Block.list[4][3].type = 'wall'; 
        Block.list[6][3].type = 'wall';
        Block.list[7][3].type = 'wall'; 
        Block.list[9][3].type = 'wall';
        Block.list[11][3].type = 'wall';
        Block.list[13][3].type = 'wall';
        
        Block.list[4][14].type = 'wall'; 
        Block.list[6][14].type = 'wall';
        Block.list[8][14].type = 'wall'; 
        Block.list[10][14].type = 'wall';
        Block.list[11][14].type = 'wall';
        Block.list[13][14].type = 'wall';
        
        Block.list[14][4].type = 'wall'; 
        Block.list[14][6].type = 'wall';
        Block.list[14][7].type = 'wall'; 
        Block.list[14][9].type = 'wall';
        Block.list[14][11].type = 'wall';
        Block.list[14][13].type = 'wall';
        
        Block.list[3][4].type = 'wall'; 
        Block.list[3][6].type = 'wall';
        Block.list[3][8].type = 'wall'; 
        Block.list[3][10].type = 'wall';
        Block.list[3][11].type = 'wall';
        Block.list[3][13].type = 'wall';
        //
        Block.list[10][4].type = 'wall';
        
        Block.list[7][13].type = 'wall';
        
        Block.list[4][7].type = 'wall';
        
        Block.list[13][10].type = 'wall';
        //
        Block.list[5][5].type = 'wall';
        Block.list[6][5].type = 'wall';
        Block.list[7][5].type = 'wall';
        Block.list[8][5].type = 'wall';
        
        Block.list[9][12].type = 'wall';
        Block.list[10][12].type = 'wall';
        Block.list[11][12].type = 'wall';
        Block.list[12][12].type = 'wall';
        
        Block.list[12][5].type = 'wall';
        Block.list[12][6].type = 'wall';
        Block.list[12][7].type = 'wall';
        Block.list[12][8].type = 'wall';
        
        Block.list[5][9].type = 'wall';
        Block.list[5][10].type = 'wall';
        Block.list[5][11].type = 'wall';
        Block.list[5][12].type = 'wall';
        //
        Block.list[10][4].type = 'wall';
        
        Block.list[7][13].type = 'wall';
        
        Block.list[4][7].type = 'wall';
        
        Block.list[13][10].type = 'wall';
        //
        Block.list[6][7].type = 'wall';
        Block.list[7][7].type = 'wall';
        Block.list[8][7].type = 'wall';
        
        Block.list[9][10].type = 'wall';
        Block.list[10][10].type = 'wall';
        Block.list[11][10].type = 'wall';
        
        Block.list[10][6].type = 'wall';
        Block.list[10][7].type = 'wall';
        Block.list[10][8].type = 'wall';
        
        Block.list[7][9].type = 'wall';
        Block.list[7][10].type = 'wall';
        Block.list[7][11].type = 'wall';
        //
                
},
    okmas: function(){
        Block.list.setings.mapName = 'Okmas';
        Block.list.setings.background = "#FCF9CC";
        Block.list.setings.spawnPoint[1] = {
            x:275,
            y:275
        };
        Block.list.setings.spawnPoint[2] = {
            x:525,
            y:275
        };
        Block.list.setings.spawnPoint[3] = {
            x:525,
            y:525
        };
        Block.list.setings.spawnPoint[4] = {
            x:275,
            y:525
        };
        
        Block.list[5][5].type = 'air';
        Block.list[6][5].type = 'air';
        Block.list[7][5].type = 'air';
        Block.list[10][5].type = 'air';
        Block.list[11][5].type = 'air';
        Block.list[12][5].type = 'air';
        
        Block.list[5][6].type = 'air';
        Block.list[6][6].type = 'air';
        Block.list[11][6].type = 'air';
        Block.list[12][6].type = 'air';
        
        Block.list[5][7].type = 'air';
        Block.list[12][7].type = 'air';
        
        Block.list[5][12].type = 'air';
        Block.list[6][12].type = 'air';
        Block.list[7][12].type = 'air';
        Block.list[10][12].type = 'air';
        Block.list[11][12].type = 'air';
        Block.list[12][12].type = 'air';
        
        Block.list[5][11].type = 'air';
        Block.list[6][11].type = 'air';
        Block.list[11][11].type = 'air';
        Block.list[12][11].type = 'air';
        
        Block.list[5][10].type = 'air';
        Block.list[12][10].type = 'air';
        
        for(var i = 1; i<= 16;i++){
            Block.list[i][1].type = 'wall';
            Block.list[1][i].type = 'wall';
            Block.list[i][16].type = 'wall';
            Block.list[16][i].type = 'wall';      
        }
        Block.list[2][2].type = 'wall';
        Block.list[6][2].type = 'wall';
        Block.list[8][2].type = 'wall';
        Block.list[9][2].type = 'wall';
        Block.list[11][2].type = 'wall';
        Block.list[15][2].type = 'wall';
        
        Block.list[3][3].type = 'wall';
        Block.list[6][3].type = 'wall';
        Block.list[11][3].type = 'wall';
        Block.list[14][3].type = 'wall';
        
        Block.list[4][4].type = 'wall';
        Block.list[6][4].type = 'wall';
        Block.list[8][4].type = 'wall';
        Block.list[9][4].type = 'wall';
        Block.list[11][4].type = 'wall';
        Block.list[13][4].type = 'wall';
        
        Block.list[2][6].type = 'wall';
        Block.list[3][6].type = 'wall';
        Block.list[4][6].type = 'wall';
        Block.list[7][6].type = 'wall';
        Block.list[10][6].type = 'wall';
        Block.list[13][6].type = 'wall';
        Block.list[14][6].type = 'wall';
        Block.list[15][6].type = 'wall';
        
        Block.list[6][7].type = 'wall';
        Block.list[7][7].type = 'wall';
        Block.list[10][7].type = 'wall';
        Block.list[11][7].type = 'wall';
        
        Block.list[2][8].type = 'wall';
        Block.list[4][8].type = 'wall';
        Block.list[13][8].type = 'wall';
        Block.list[15][8].type = 'wall';
        
        Block.list[2][15].type = 'wall';
        Block.list[6][15].type = 'wall';
        Block.list[8][15].type = 'wall';
        Block.list[9][15].type = 'wall';
        Block.list[11][15].type = 'wall';
        Block.list[15][15].type = 'wall';
        
        Block.list[3][14].type = 'wall';
        Block.list[6][14].type = 'wall';
        Block.list[11][14].type = 'wall';
        Block.list[14][14].type = 'wall';
        
        Block.list[4][13].type = 'wall';
        Block.list[6][13].type = 'wall';
        Block.list[8][13].type = 'wall';
        Block.list[9][13].type = 'wall';
        Block.list[11][13].type = 'wall';
        Block.list[13][13].type = 'wall';
        
        Block.list[2][11].type = 'wall';
        Block.list[3][11].type = 'wall';
        Block.list[4][11].type = 'wall';
        Block.list[7][11].type = 'wall';
        Block.list[10][11].type = 'wall';
        Block.list[13][11].type = 'wall';
        Block.list[14][11].type = 'wall';
        Block.list[15][11].type = 'wall';
        
        Block.list[6][10].type = 'wall';
        Block.list[7][10].type = 'wall';
        Block.list[10][10].type = 'wall';
        Block.list[11][10].type = 'wall';
        
        Block.list[2][9].type = 'wall';
        Block.list[4][9].type = 'wall';
        Block.list[13][9].type = 'wall';
        Block.list[15][9].type = 'wall';

    },
    lobby: function(){
        Block.list.setings.mapName = 'Lobby';
        Block.list.setings.background = "#FCF9CC";
        Block.list.setings.spawnPoint[1] = {
            x:125,
            y:125
        };
        Block.list.setings.spawnPoint[2] = {
            x:675,
            y:125
        };
        Block.list.setings.spawnPoint[3] = {
            x:125,
            y:675
        };
        Block.list.setings.spawnPoint[4] = {
            x:675,
            y:675
        };
        
        for(var i = 1; i<= 16;i++){
            Block.list[i][1].type = 'wall';
            Block.list[1][i].type = 'wall';
            Block.list[i][16].type = 'wall';
            Block.list[16][i].type = 'wall';      
        }
        Block.list[7][2].type = 'wall';
        Block.list[8][2].type = 'wall';
        Block.list[9][2].type = 'wall';
        Block.list[10][2].type = 'wall';
        
        Block.list[7][8].type = 'wall';
        Block.list[7][9].type = 'wall';
        Block.list[8][8].type = 'wall';
        Block.list[9][8].type = 'wall';
        Block.list[8][9].type = 'wall';
        Block.list[9][9].type = 'wall';
        Block.list[10][8].type = 'wall';
        Block.list[10][9].type = 'wall';
    },
    dots: function(){
        Block.list.setings.mapName = 'Dots';
        Block.list.setings.background = "#FCF9CC";

        Block.list.setings.spawnPoint[1] = {
            x:125,
            y:125
        };
        Block.list.setings.spawnPoint[2] = {
            x:675,
            y:125
        };
        Block.list.setings.spawnPoint[3] = {
            x:125,
            y:675
        };
        Block.list.setings.spawnPoint[4] = {
            x:675,
            y:675
        };
        for(var y = 1; y <=16;y+=2)
            for(var x = 1; x <=16;x+=2)
                Block.list[x][y].type = 'wall';
        for(var i = 1; i<= 16;i++){
            Block.list[i][1].type = 'wall';
            Block.list[1][i].type = 'wall';
            Block.list[i][16].type = 'wall';
            Block.list[16][i].type = 'wall';      
        }
        Block.list[3][3].type = 'air';
        Block.list[3][2].type = 'air';            
        Block.list[2][3].type = 'air';
        Block.list[2][4].type = 'air';
        Block.list[4][2].type = 'air';
        
        Block.list[14][14].type = 'air';
        Block.list[15][14].type = 'air';            
        Block.list[14][15].type = 'air';
        Block.list[13][15].type = 'air';
        Block.list[15][13].type = 'air';
        
        Block.list[14][3].type = 'air';
        Block.list[14][2].type = 'air';            
        Block.list[15][3].type = 'air';
        Block.list[13][2].type = 'air';
        Block.list[15][4].type = 'air';
        
        Block.list[2][13].type = 'air';
        Block.list[2][14].type = 'air';            
        Block.list[3][14].type = 'air';
        Block.list[3][15].type = 'air';
        Block.list[4][15].type = 'air';
        
    },
    samko: function(){
        Block.list.setings.mapName = 'Samko';
        Block.list.setings.background = "#FCF9CC";
        Block.list.setings.spawnPoint[1] = {
            x:125,
            y:125
        };
        Block.list.setings.spawnPoint[2] = {
            x:675,
            y:125
        };
        Block.list.setings.spawnPoint[3] = {
            x:125,
            y:675
        };
        Block.list.setings.spawnPoint[4] = {
            x:675,
            y:675
        };
        
        Block.list[3][3].type = 'air';
        Block.list[4][3].type = 'air';
        Block.list[13][3].type = 'air';
        Block.list[14][3].type = 'air';
        
        Block.list[3][4].type = 'air';
        Block.list[14][4].type = 'air';
        
        Block.list[3][14].type = 'air';
        Block.list[4][14].type = 'air';
        Block.list[13][14].type = 'air';
        Block.list[14][14].type = 'air';
        
        Block.list[3][13].type = 'air';
        Block.list[14][13].type = 'air';

        
      
        
        for(var i = 1; i<= 16;i++){
            Block.list[i][1].type = 'wall';
            Block.list[1][i].type = 'wall';
            Block.list[i][16].type = 'wall';
            Block.list[16][i].type = 'wall';      
        }
        
        Block.list[2][2].type = 'wall';
        Block.list[3][2].type = 'wall';
        Block.list[4][2].type = 'wall';
        Block.list[5][2].type = 'wall';
        Block.list[7][2].type = 'wall';
        Block.list[10][2].type = 'wall';
        Block.list[12][2].type = 'wall';
        Block.list[13][2].type = 'wall';
        Block.list[14][2].type = 'wall';
        Block.list[15][2].type = 'wall';
        
        Block.list[2][3].type = 'wall';
        Block.list[7][3].type = 'wall';
        Block.list[10][3].type = 'wall';
        Block.list[15][3].type = 'wall';
        
        Block.list[2][4].type = 'wall';
        Block.list[4][4].type = 'wall';
        Block.list[6][4].type = 'wall';
        Block.list[7][4].type = 'wall';
        Block.list[10][4].type = 'wall'
        Block.list[11][4].type = 'wall';
        Block.list[13][4].type = 'wall';
        Block.list[15][4].type = 'wall';
        
        Block.list[2][5].type = 'wall';
        Block.list[7][5].type = 'wall';
        Block.list[10][5].type = 'wall';
        Block.list[15][5].type = 'wall';
        
        Block.list[4][6].type = 'wall';
        Block.list[13][6].type = 'wall';
        
        Block.list[2][7].type = 'wall';
        Block.list[3][7].type = 'wall';
        Block.list[4][7].type = 'wall';
        Block.list[5][7].type = 'wall';
        Block.list[7][7].type = 'wall';
        Block.list[10][7].type = 'wall';
        Block.list[12][7].type = 'wall';
        Block.list[13][7].type = 'wall';
        Block.list[14][7].type = 'wall';
        Block.list[15][7].type = 'wall';
        
        Block.list[2][15].type = 'wall';
        Block.list[3][15].type = 'wall';
        Block.list[4][15].type = 'wall';
        Block.list[5][15].type = 'wall';
        Block.list[7][15].type = 'wall';
        Block.list[10][15].type = 'wall';
        Block.list[12][15].type = 'wall';
        Block.list[13][15].type = 'wall';
        Block.list[14][15].type = 'wall';
        Block.list[15][15].type = 'wall';
        
        Block.list[2][14].type = 'wall';
        Block.list[7][14].type = 'wall';
        Block.list[10][14].type = 'wall';
        Block.list[15][14].type = 'wall';
        
        Block.list[2][13].type = 'wall';
        Block.list[4][13].type = 'wall';
        Block.list[6][13].type = 'wall';
        Block.list[7][13].type = 'wall';
        Block.list[10][13].type = 'wall'
        Block.list[11][13].type = 'wall';
        Block.list[13][13].type = 'wall';
        Block.list[15][13].type = 'wall';
        
        Block.list[2][12].type = 'wall';
        Block.list[7][12].type = 'wall';
        Block.list[10][12].type = 'wall';
        Block.list[15][12].type = 'wall';
        
        Block.list[4][11].type = 'wall';
        Block.list[13][11].type = 'wall';
        
        Block.list[2][10].type = 'wall';
        Block.list[3][10].type = 'wall';
        Block.list[4][10].type = 'wall';
        Block.list[5][10].type = 'wall';
        Block.list[7][10].type = 'wall';
        Block.list[10][10].type = 'wall';
        Block.list[12][10].type = 'wall';
        Block.list[13][10].type = 'wall';
        Block.list[14][10].type = 'wall';
        Block.list[15][10].type = 'wall';
        
        
        
    }
};

var stopPlayerMovement = function(player){
    player.pressingRight = false;
    player.pressingLeft = false;
    player.pressingUp = false;
    player.pressingDown = false;
    player.pressingSpace = false;
}
                
var choseMap = function(nMap){
    nMap = 1/nMap;
    var a = Math.random();
    //var a = 0.7;
    switch (true) {
        case (a < (nMap*1)):
            Map.okmas();
            break;
        case (a < (nMap*2)):
            Map.darkFores();
            break;
        case (a < (nMap*3)):
            Map.dots();
            break;
        default:
            Map.samko();
    }
}

var setSpawnPoint = function(mapList, blockList){
    mapList.spawnPoint[1] = {
        x: blockList.spawnPoint[1].x,
        y: blockList.spawnPoint[1].y
    };
    mapList.spawnPoint[2] = {
        x: blockList.spawnPoint[2].x,
        y: blockList.spawnPoint[2].y
    };
    mapList.spawnPoint[3] = {
        x: blockList.spawnPoint[3].x,
        y: blockList.spawnPoint[3].y
    };
    mapList.spawnPoint[4] = {
        x: blockList.spawnPoint[4].x,
        y: blockList.spawnPoint[4].y
    };
    mapList.mapName = blockList.mapName;
}

var nacitaBlockList = function(type){
    var idX =  0;
    var idY =  0;
    for(var x = 0; x <= 800; x += 50){
        idX++;
        /*bombList[idX] = new Array(17)
        itemList[idX] = new Array(17)
        explosionList[idX] = new Array(17)*/
        Block.list[idX] = new Array(17)
        for(var y = 0; y <= 800; y += 50){
            idY++;
            /*Bomb(idX, idY, false)
            Item(idX, idY, false, 'empty')
            Explosion(idX, idY, false)*/
            Block.list[idX][idY] = Block({
                x: x+25, 
                y: y+25, 
                type: type,
                blockX: idX, 
                blockY: idY
            });
        }
        idY = 0;            
    }
}

var countArray = function(Array){
        var count = 0;
        for(var key in Array)count++;
        return count;
}

var generateNewMap = function(){
    nacitaBlockList('air');
    Map.lobby();
    
    var firstIndex = Math.random();
    mapList[firstIndex] = new Array();
    for(var x = 1; x <= 16; x++){
        mapList[firstIndex][x] = new Array(17);
        for(var y = 1; y <= 16; y++){
            mapList[firstIndex][x][y] = Block.list[x][y];
            mapList[firstIndex][x][y].map = firstIndex;
            mapList[firstIndex][x][y].changeBlock();
        }
    }
    
    mapList[firstIndex].setings = {};
    mapList[firstIndex].setings.timer = 11;
    mapList[firstIndex].setings.closedTimer = 4;
    mapList[firstIndex].setings.movement = true;
    mapList[firstIndex].setings.attack = false;
    mapList[firstIndex].setings.state = 'Map.lobby';//Map.lobby//lobbyTimer//lobbyClosed//inGame
    mapList[firstIndex].setings.imgSlot = new Array();
    mapList[firstIndex].setings.mapName = 'Lobby';
    mapList[firstIndex].setings.spawnPoint = new Array();
    
    
    for(var i = 0; i <= 9; i++)
        mapList[firstIndex].setings.imgSlot[i] = 'empty';
    
    freeSlot[firstIndex] = new Array(5);
    freeSlot[firstIndex][1] = 'empty';
    freeSlot[firstIndex][2] = 'empty';
    freeSlot[firstIndex][3] = 'empty';
    freeSlot[firstIndex][4] = 'empty';
    
    freeSlot[firstIndex][0] = new Object;
    freeSlot[firstIndex][0].state = 'Map.lobby';
    
    Player.list[firstIndex] = new Array(5);
    Bomb.list[firstIndex] = new Array();
    Disconnect.list[firstIndex] = new Array();
    
    return firstIndex;
};

var explozia = function(map){
    for(var i in Bomb.list[map]){
        var bomb = Bomb.list[map][i];
        if(Player.list[map][bomb.owner] != undefined){ //odladuje bug kôli ktoremu padal server
            
            bomb.timer--;
            if(bomb.timer <= 0){
                var pack = [];
                var countX =  0;
                var countY = -0;
                mapList[map][bomb.blockX][bomb.blockY].explosion = true;
                mapList[map][bomb.blockX][bomb.blockY].explosionTimer = 20;
                mapList[map][bomb.blockX][bomb.blockY].explosionOwner = Player.list[map][bomb.owner].name;
                do countY++; while(mapList[map][bomb.blockX+countX][bomb.blockY+countY].exploziaDoStrany(countX,countY,bomb.owner) != true);                                
                    if(zmena == true){
                        countY++;
                        countX++;
                        zmena = false;
                    }else if(zmena == 'air') countY++;
                    pack.push({
                        downY: countY-1,
                    }); 
                    var countY = +0;
                    var countX = -0;
                do countY--; while(mapList[map][bomb.blockX+countX][bomb.blockY+countY].exploziaDoStrany(countX,countY,bomb.owner) != true);                                
                    if(zmena == true){
                        countY--;
                        countX--;
                        zmena = false;
                    }else if(zmena == 'air') countY--;                            
                    pack.push({
                        upY: countY*-1-1,
                    }); 
                    var countX = -0;
                    var countY =  0;
                do countX++; while(mapList[map][bomb.blockX+countX][bomb.blockY+countY].exploziaDoStrany(countX,countY,bomb.owner) != true);                                 
                    if(zmena == true){
                        countY++;
                        countX++;
                        zmena = false;
                    }else if(zmena == 'air') countX++;                           
                    pack.push({
                        rightX: countX-1,
                    }); 
                    var countX = +0;
                    var countY =  0;
                do countX--; while(mapList[map][bomb.blockX+countX][bomb.blockY+countY].exploziaDoStrany(countX,countY,bomb.owner) != true);                                 
                    if(zmena == true){
                        countY--;
                        countX--;
                        zmena = false;
                    }else if(zmena == 'air')countX--;         
                    pack.push({
                        leftX: countX*-1-1,
                        id: bomb.id,
                    }); 
                
                for(var a in Player.list[map])
                    SOCKET_LIST[Player.list[map][a].id].emit('deleteBomb',{pack});
                
                mapList[map][bomb.blockX][bomb.blockY].bomb = false;
                Player.list[map][bomb.owner].pocetBomb++;
                delete Bomb.list[map][i];
                
        
            }    
        }    
    }    
}

var deletePlayer = function(map,key){
    if(countArray(Disconnect.list[map]) == countArray(Player.list[map])){
        delete mapList[map];
        delete Player.list[map];
        delete freeSlot[map];
        delete Bomb.list[map]; 
        delete Disconnect.list[map];
        delete SOCKET_LIST[key];
        console.log("Mapa bola zmazana!");
    
    }else if(Disconnect.list[map][key].timer-- <= 0){
        console.log("Hrac bol zmazany!");
        
        delete Player.list[map][key];
        delete SOCKET_LIST[key];
        delete Disconnect.list[map][key];
        
        message.winner(map);
    }else if(mapList[map].setings.mapName == 'Lobby'){
        delete Player.list[map][key];
        delete SOCKET_LIST[key];
        delete Disconnect.list[map][key];
        
        for(var id in Player.list[map])
            SOCKET_LIST[id].emit('remove',{id: key});
            
    }
};

var changeSkin = function(player, value){
    for(var key in Player.list[player.map])
        SOCKET_LIST[Player.list[player.map][key].id].emit('changeSkin',{id:player.id,value: value});
};

var isAdminLogged = function(name){
    if(name == 'Zhooty' 
    || name == 'Benji'
    || name == 'Kunji'
    || name == 'Bunji'
    || name == 'Kunjihadista')
        return true;
    else 
        return false;
};

var setPlayerToLobby = function(freeSlotKey, player, socket, key){
    switch(true){
        case(freeSlotKey[1] == 'empty'):
            player = Player({
                id: socket.id,
                x:125 ,
                y:125 ,
                img: "player1",
                slot: 1,
                map: key,
            });
            freeSlotKey[1] = 'full';
            socket.map = key;
            return player;
        case(freeSlotKey[2] == 'empty'):
            player = Player({
                id: socket.id,
                x:675 ,
                y:125 ,
                img: "player2",
                slot: 2,
                map: key,
            });
            freeSlotKey[2] = 'full';
            socket.map = key;
            return player;
        case(freeSlotKey[3] == 'empty'):
            player = Player({
                id: socket.id,
                x:125 ,
                y:675 ,
                img: "player2",
                slot: 3,
                map: key,
            });
            freeSlotKey[3] = 'full';
            socket.map = key;
            return player;
        case(freeSlotKey[4] == 'empty'):
            player = Player({
                id: socket.id,
                x:675 ,
                y:675 ,
                img: "player2",
                slot: 4,
                map: key,
            });
            freeSlotKey[4] = 'full';
            socket.map = key;
            return player;
        default:
            delete freeSlot[key];
            var newMap = generateNewMap();
            
            player = Player({
                id: socket.id,
                x:125 ,
                y:125 ,
                img: "player1",
                slot: 1,
                map: newMap,
            });
            freeSlot[newMap][1] = 'full';
            socket.map = newMap;
            return player;
    }
};

var nameCorrect = function(username){
    var pomocna = "";
    for(var i = 0; i<= 12;i++){
        if(username[i] != " " && username[i] != undefined){
            pomocna += username[i];
        }
    }
    username = pomocna;
    if(username == "")username = "Player";
    return username;
};
    

              //////   INPUT OUTPUT   \\\\\\ 
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    socket.emit('socketId',socket.id);
    SOCKET_LIST[socket.id] = socket;
    var player;
    
    socket.on('signIn',function(data){
    //adminske logovanie do hry    
    if(isAdminLogged(data.username) && data.password != "keltik"){
        socket.emit('signInResponse',{success:'admin'});
    }else if(!isAdminLogged(data.username) || data.password == "keltik"){
        if(socket.map != undefined){
            delete Player.list[socket.map][socket.id];
            if(countArray(Player.list[socket.map]) == 0){
                console.log('mapa bola zmazana');
                delete mapList[socket.map];
                delete Player.list[socket.map];
                delete freeSlot[socket.map];
                delete Bomb.list[socket.map];
            }
        }
        
        //vytvori novu lobby ak sa hrač pripoji a ešte nieje urobena
        //to znamena ze sa pripoji ako prvy
        if(countArray(freeSlot) == 0)
            generateNewMap();
            
        for(var key in freeSlot){
            //tato funkcia nastavuje poziciu pre novyh hracov v lobby
            player = setPlayerToLobby(freeSlot[key], player, socket, key);
            //zapiše hrača do zoznamu
            Player.list[socket.map][socket.id] = player;
            //opravuje nespravne meno, ked su pred menom medzery
            //alebo je moc dlhe
            Player.list[socket.map][socket.id].name = nameCorrect(data.username);
            socket.username = Player.list[socket.map][socket.id].name;
            console.log(socket.username + ' joined the game! ' + countArray(SOCKET_LIST) + ' players in game.');
            socket.emit('signInResponse',{success:true});

        }
        //posiela klientovi info o novom hracovi
        var initPack = [];
        for(var key in Player.list[socket.map])
            initPack.push({
            	id:Player.list[socket.map][key].id,
            	x:Player.list[socket.map][key].x,
            	y:Player.list[socket.map][key].y,	
            	name:Player.list[socket.map][key].name,
            	hp:Player.list[socket.map][key].hp,
            	power:Player.list[socket.map][key].power,
            	pocetBomb:Player.list[socket.map][key].pocetBomb,
            	spd:Player.list[socket.map][key].spd,
            	antiStun:Player.list[socket.map][key].antiStun,
            	img:Player.list[socket.map][key].img,
            });
        for(var key in Player.list[socket.map])
            SOCKET_LIST[key].emit('init',{initPack});
        message.server(socket.map, '<font color="#FFA07A">' + player.name + '</font>' + '<font color="#FFD700"> joined the game!</font>');
        
        if(countArray(Player.list[socket.map]) == 1){
            mapList[socket.map].setings.state == 'Map.lobby';
            socket.emit('addToChat','<font color="#FFD700">' + 'You need at least two players' + '</font>');
        }else
            mapList[socket.map].setings.state = 'lobbyTimer';
        
    	//vloží novu mapu do mapPacku
    	var mapPack = [];    
    	var idX =  -1;
        var idY =  0;
        for(var x = 0; x < 800; x += 50){
            idX++;
            mapPack.push([]);
            for(var y = 0; y < 800; y += 50){
                idY++;
                mapPack[idX].push(Block.list[idX+1][idY]);
            }
            idY = 0;            
        }
        socket.emit('loadMap',{mapPack, 
            background: Block.list.setings.background,
            name: Block.list.setings.mapName
        });

    }
        
    });
   
    socket.on('disconnect',function(){
        if(Player.list[socket.map] == undefined)
            delete SOCKET_LIST[socket.id];
        else{ //undefined je vtedy ked sa este nepripojil do hry ale vypol stranku
            if(freeSlot[socket.map] != undefined) //undefined je vtedy ked uz zacala hra a freeSlot bol zmazany
                freeSlot[socket.map][Player.list[socket.map][socket.id].slot] = 'empty';
            
            message.server(socket.map, player.name + ' left the game!');
            console.log(player.name + ' left the game!');
            
            changeSkin(Player.list[socket.map][socket.id], 750);
            
            Disconnect(Player.list[socket.map][socket.id]);
            
            console.log(countArray(Player.list[socket.map]));
                
            if(countArray(Player.list[socket.map]) == 2
            && mapList[socket.map].setings.state != 'inGame'){
                mapList[socket.map].setings.state = 'Map.lobby';
                mapList[socket.map].setings.timer = 11;
                message.server(socket.map,'<font color="#FFD700">' + 'You need at least two players for game' + '</font>');
            }
        }
        
    });
    
    socket.on('sendMsgToServer',function(data){
        var playerName = ("" + socket.username).slice(0,15);
        for(var i in Player.list[socket.map]){
            SOCKET_LIST[i].emit('addToChat','<b><font color="#FFA07A">' +  playerName +  ': ' + '</font></b>' + data);
        }
    });
   
    socket.on('evalServer',function(data){
        if(!isAdminLogged(socket.username))
            return;
        if(data[0]=="s" && data[1]=="a" && data[2]=="y" && data[3]==" " )
            message.say(data);
        else{
            var res = eval(data);
            socket.emit('evalAnswer',res);
        }
    });
    
    socket.on('keyPress',function(data){
    if(player != undefined
    && mapList[socket.map].setings.movement
    && !player.dead){
        if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
        else if(data.inputId === 'space'
        && mapList[player.map].setings.attack){
            player.pressingSpace = data.state;
            player.generateBomb();
        }
        else if(data.inputId === 'stop')
                stopPlayerMovement(player);
    }
        
    });

    socket.on('pingEmit',function(data){
        socket.emit('pingBack',{Package: data.Package});
    });
  
});


var count = 0;
var statsChange = false;
              //////   MAIN LOOP   \\\\\\
setInterval(function(){
    
    for(var map in Disconnect.list)
        for(var key in Disconnect.list[map])
            deletePlayer(map, key);
    
    count++;
    for(var map in mapList){
        explozia(map);
        if(mapList[map].setings.state != 'inGame')
            switch (true) {
                case (mapList[map].setings.state == 'lobbyTimer'):
                    if(count % 50 == 0) //50 == 1s
                        message.lobby(mapList[map],map);
                    break;
                case (mapList[map].setings.state == 'lobbyClosed'):
                    if(count % 50 == 0)  //50 == 1s  
                        message.closedLobby(mapList[map], map);
                    break;
            }
        
        for(var x in mapList[map])
            for(var y in mapList[map][x])
                if(mapList[map][x][y].explosion)
                    if(mapList[map][x][y].explosionTimer-- <= 0)
                        
                        mapList[map][x][y].explosion = false;

        var pack = [];
        var statPack = [];
        for(var i in Player.list[map]){
            var player = Player.list[map][i];
            player.aktualizjePoziciuBlockXY();
            
            //stara sa o staty hracov
            if(mapList[map][player.blockX][player.blockY].explosion
            && !player.immortality){
                statsChange = true;
                player.immortality = true;
                if(--player.hp <= 0 && !player.dead){
                    SOCKET_LIST[player.id].emit('dead');
                    player.dead = 'true';
                    message.server(player.map, player.name + ' was killed by ' + mapList[map][player.blockX][player.blockY].explosionOwner);
                    
                    message.winner(map);
                    
                    changeSkin(player, 750);
                    break;
                }
                if(!player.antiStun && !player.dead){
                    player.stun = true;
                    changeSkin(player, 250);
                }else if(!player.dead)changeSkin(player, 500);
            }else if(player.immortality)
                if(player.immortality_timer-- <= 0){
                    player.immortality = false;
                    player.stun = false;
                    player.immortality_timer = 30;
                    if(!player.dead)changeSkin(player, 0);
                }
            if(statsChange){
                statsChange = false;
                if (player.dead) player.hp = 0;
                statPack.push({
                    id:player.id,
                    hp:player.hp,
                    spd:player.spd,
                    pocetBomb:player.pocetBomb,
                    power:player.power
                });
                for(var i in Player.list[map]){
                    var socket = SOCKET_LIST[i];
                        socket.emit('statsUpdate',statPack);
                }
            }
            
            if(!player.dead)
                player.updatePosition(player.map);
            pack.push({
                x:player.x,
                y:player.y,
                id:player.id,
            });    
        }
        for(var i in Player.list[map]){
            var socket = SOCKET_LIST[i];
                socket.emit('update',pack);
        }
    }
    
},20);



/*
    Každý objekt bude mat atribut mapID
    
    do každeho objektu pridam další index,
    podla toho v akej mape sa nachádzajú
    
    
    ked vybuchne bomba:
        spraví explóziu do každej strany
        - exploziu bude robit dovtedy dokedy nenarazí na "block.type == dirt/wall"
          alebo do "player.power == pocet explozii"
        - klientovy odošle udaje o 
            - centre explozie
            - okrajoch explozie
            
            
            
    ked bude ma hrac 0 hp tak ho zmaze z playerlistu 
    ale v v socket list este ostane na obrazovke sa mu 
    zobrazi nápis ze je spectator a dva buttony:
        1. nova hra
            - pripoji hraca do novej hry s rovnakým menom
        2. ukoncit hru 
            - hodi hraca na login
            - zmaze ho zo socketlist
*/
