var planets = new Page( 'planets' );


planets.textChunk = [

  "   The joy Shams felt could not be described with mortal words. There was not just one more of him. There were Hundreds. The Lonliness that he had felt earlier in his journey had vanished, and the only thing left was comfort. Ecstasy.",
  "",
  "",
  "He watched the way they swam, following their iridescent wanderings. Although he had been to this place before, it somehow felt different. Each color a bit more defined, each star that much more bright.",
  "",
  "",
  "He still did not know why he had risen. Where his new found friends were going to. The darkness surrounding them was still overbearing, and stars did not do enough to make him forget it. But there, in that moment. They swam together, and that was enough."


].join("\n");


planets.planets = [];
planets.furryGroups = [];
planets.furryTails = [];

planets.colorSchemes = [

  [ 
    'Loki',
    1,
    new THREE.Color( '#1157ff' ),
    new THREE.Color( '#00a4ff' ),
    new THREE.Color( '#5e2dff' ),
    new THREE.Color( '#00fff0' ),
    'halle',
    
  ],


  [ 
    'Friend1',
    3,
    new THREE.Color( '#fa0202' ),
    new THREE.Color( '#faef42' ),
    new THREE.Color( '#ff0000' ),
    new THREE.Color( '#ff7800' ),
    'main'
  ],

  [
    'Friend2',
    3,
    new THREE.Color( '#5f5fff' ),
    new THREE.Color( '#61a2ff' ),
    new THREE.Color( '#52fff4' ),
    new THREE.Color( '#78ffc7' ),
    'shuffle'
  ],

  [ 
    'Friend3',
    4,
    new THREE.Color( '#ffa400' ),
    new THREE.Color( '#ee3700' ),
    new THREE.Color( '#fce05e' ),
    new THREE.Color( '#ff70cc' ),
    'wood'
  ],

]

planets.audio = {};
var f = 'audio/credits/';
planets.audio.halle = planets.loadAudio( 'halle' , f + 'halle.mp3' );
planets.audio.main = planets.loadAudio( 'main' , f + 'main.mp3' );
planets.audio.water = planets.loadAudio( 'water' , f + 'water.mp3' );
planets.audio.wood = planets.loadAudio( 'wood' , f + 'wood.mp3' );
planets.audio.musik = planets.loadAudio( 'musik' , f + 'musik.mp3' );
planets.audio.shuffle = planets.loadAudio( 'shuffle' , f + 'shuffle.mp3' );

var f = 'pages/planets/';

planets.loadShader( 'furryParticles' , f + 'vs-furryParticles' , 'vs' );
planets.loadShader( 'furryParticles' , f + 'fs-furryParticles' , 'fs' );
planets.loadShader( 'furryTail'      , f + 'vs-furryTail' , 'vs' );
planets.loadShader( 'furryTail'      , f + 'fs-furryTail' , 'fs' );
planets.loadShader( 'furryHead'      , f + 'vs-furryHead' , 'vs' );
planets.loadShader( 'furryHead'      , f + 'fs-furryHead' , 'fs' );
planets.loadShader( 'furryTailSim'   , f + 'furryTailSim' , 'ss' );
planets.loadShader( 'furryHeadSim'   , f + 'furryHeadSim' , 'ss' );

planets.loadShader( 'planet' , f + 'vs-planet' , 'vs' );
planets.loadShader( 'planet' , f + 'fs-planet' , 'fs' );


planets.addToStartArray( function(){

  var newPos = new THREE.Vector3( 0 , 0 , 1000 );
  G.camera.position = this.scene.position.clone().add( newPos );
  G.camera.lookAt( this.scene.position );

}.bind( planets ));


/*

   Creating Planets and Tails

*/
planets.addToStartArray( function(){

  this.center = new THREE.Mesh(
    new THREE.IcosahedronGeometry( 10 , 0 ),
    new THREE.MeshNormalMaterial({side:THREE.DoubleSide})
  );

  G.scene.add( this.center );


  // TODO: MAKE THIS Part of Global
  this.lineGeo = createLineGeo();

  for( var i= 0; i< this.colorSchemes.length; i++ ){

    var bait = this.center.clone();
    bait.scale.multiplyScalar( 5.3 );
    //scene.add( bait );

    var c = this.colorSchemes[i];

    var numOf = c[1]; //+ Math.floor( Math.random() * 10 );

    var col1 = new THREE.Vector3( c[2].r , c[2].g , c[2].b );
    var col2 = new THREE.Vector3( c[3].r , c[3].g , c[3].b );
    var col3 = new THREE.Vector3( c[4].r , c[4].g , c[4].b );
    var col4 = new THREE.Vector3( c[5].r , c[5].g , c[5].b );

    var audio = this.audio[c[6]];
    var planet = new Planet( this , c[0] ,  audio , col1 , col2 , col3 , col4 );

    this.planets.push( planet );

    var f = new FurryGroup( this , c[0], audio , numOf, {
            
      center: this.center,
      bait: bait,
      color1: col1,
      color2: col2,
      color3: col3,
      color4: col4,

    });

    this.furryGroups.push( f );

  }


  for( var i = 0; i < this.furryGroups.length; i++ ){

    this.furryGroups[i].updateBrethren();

  }

  for( var i = 0; i < this.furryTails.length; i++ ){

    var fT = this.furryTails[i];

    for( var j = 0; j < this.planets.length; j++ ){

      fT.addCollisionForce( this.planets[j].position , 100 );
      if( fT.type == this.planets[j].type ){
        fT.addDistanceForce( this.planets[j].position , .00004 );  
      }else{
        fT.addDistanceForce( this.planets[j].position , .00001 );

      }

    }
  
  }

}.bind( planets ));




/*

  Setting up audio
  TODO: Make into looper

*/
planets.addToStartArray( function(){

  for( var i = 0; i < this.planets.length; i++ ){

    this.planets[i].audio.play();

  }


}.bind( planets ));


/*
 
   Text

*/
planets.addToStartArray( function(){

  this.textParticles = G.text.createTextParticles( this.textChunk );


  var s = this.textParticles.size;

  var sim = G.shaders.ss.textSim;

  var physics = new PhysicsRenderer( s , sim , G.renderer );
  physics.setUniform( 't_to' , {
    type:"t",
    value:this.textParticles.material.uniforms.t_lookup.value
  });
 

  var repelPosArray = [];
  for( var i =0; i < this.furryTails.length; i++ ){

    repelPosArray.push( this.furryTails[i].position );

  }

  repelPosArray.push( G.rHand.hand.position );
  repelPosArray.push( G.lHand.hand.position );
  repelPosArray.push( G.iPoint );

  for( var i = 0; i < this.planets.length; i++ ){

    repelPosArray.push( this.planets[i].position );

  }

  console.log( 'REPEL POS LENGTH' );
  console.log( repelPosArray.length );

  var repelPos = {
    type:"v3v",
    value: repelPosArray
  }

  var speedUniform = { type:"v3" , value:new THREE.Vector3() }
  var cameraMat = { type:"m4" , value:G.camera.matrixWorld}
  var cameraPos = { type:"v3" , value:G.camera.position } 

  var offsetPos = { type:"v3" , value: new THREE.Vector3( 0 , 150 , 0 ) }
  var alive     = { type:"f" , value:1}

  physics.setUniform( 'speed' , speedUniform );
  physics.setUniform( 'timer' , G.dT );
  physics.setUniform( 'cameraMat' , cameraMat );
  physics.setUniform( 'cameraPos' , cameraPos );
  physics.setUniform( 'repelPos'  , repelPos );
  physics.setUniform( 'alive'     , alive    );

  physics.addBoundTexture( this.textParticles , 't_lookup' , 'output' );


  this.textParticles.physics = physics;

  this.scene.add( this.textParticles );
  






}.bind( planets ));




planets.addToAllUpdateArrays( function(){


  for( var i = 0; i < this.furryTails.length; i++ ){

    var furryTail = this.furryTails[i];
    furryTail.updateTail();

  }


  for( var i = 0; i < this.furryTails.length; i++ ){

    var furryTail = this.furryTails[i];
    furryTail.updatePhysics();

  }

  this.textParticles.physics.update();


}.bind( planets ) );



