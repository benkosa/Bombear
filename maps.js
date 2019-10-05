var Map = {
    darkFores: function(){
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
        
        Block.list.setings.mapName = 'Okmas';
        
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
        Block.list[7][8].type = 'wall';
        Block.list[7][9].type = 'wall';
        Block.list[8][8].type = 'wall';
        Block.list[9][8].type = 'wall';
        Block.list[8][9].type = 'wall';
        Block.list[9][9].type = 'wall';
        Block.list[10][8].type = 'wall';
        Block.list[10][9].type = 'wall';
    }    
};