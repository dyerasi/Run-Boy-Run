//global ring count variable
//let ring_count = 0;

window.Game_Scene = window.classes.Game_Scene =
class Game_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   )
            context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) );
        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 36.59, 20.14, -40.49 ), Vec.of( 1,0,-3 ), Vec.of( 0,1,0 ) );
        this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );
        // ***movement booleans***
        this.jump_bool = 0;
        this.left_bool = 0;
        this.right_bool = 0;
        this.jump_end = 0;
        this.right_end = 0;
        this.left_end = 0;
        this.main_ring_count = 0;
        this.ring_count = 0;
       // this.start_i = 1;
        //player movement constraints
        this.player_left_limit = 21;
        this.player_right_limit = 61;


        const shapes = {
                         box: new Cube(),
                         sphere2: new (Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
                         sphere3: new (Subdivision_Sphere)(3),
                         sphere4: new (Subdivision_Sphere)(4),
                         torus: new Torus(15,15),
                       }

        //shapes.box.texture_coords = shapes.box.texture_coords.map(v => Vec.of(v[0], v[1]));
        this.submit_shapes( context, shapes );
                                     
                                     // Make some Material objects available to you:
        this.materials =
          { test:     context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), { ambient:.2 } ),

            path: context.get_instance(Phong_Shader).material(
                  Color.of(0,0,0,1),
                {
                  ambient: 1,
                  texture: context.get_instance("./assets/road.jpg", false),
                }
            ),

            shrub: context.get_instance(Phong_Shader).material(
                  Color.of(0,0,0,1),
                  {
                      ambient: 1,
                      texture: context.get_instance("./assets/grass3.png", false),
                  }
              ),
            //KIA:
            log:   context.get_instance(Phong_Shader).material(
                Color.of(0,0,0,1),
                {
                    ambient: 1,
                    texture: context.get_instance("./assets/wood.jpg", false),
                }
            ),//END

            //KIA:
            ring:   context.get_instance(Phong_Shader).material(
                Color.of(255/255,215/255,0,1),
                {
                    ambient: 1,
                    //texture: context.get_instance("./assets/ring.jpg", false),
                }
            ),//END

            boundary: context.get_instance(Phong_Shader).material(
                  Color.of(0,0,0,1),
                  {
                      ambient: 1,
                      texture: context.get_instance("./assets/grass4.jpg", false),
                  }
              ),

            player: context.get_instance(Phong_Shader).material(
              Color.of(0.678, 0.847, 0.902, 1), //soft light blue
              {specularity: 1},
              {ambient: 1}
            ),

            chaser: context.get_instance(Phong_Shader).material(
                Color.of(181/255,101/255,29/155,1),
                {
                  ambient: 1,
                  gouraud: 1,
                }
            ),
          }

        this.lights = [ new Light( Vec.of( 5,-10,5,1 ), Color.of( 0, 1, 1, 1 ), 1000 ) ];
        //player and chaser state
        this.chaser_transform = Mat4.identity().times(Mat4.translation([40, 15, -1]));
        this.player_transform = this.chaser_transform.times(Mat4.translation([0, 0, 10])).times(Mat4.translation([0,0,5]));
        this.camera_model_transform = Mat4.identity().times(Mat4.translation([40, 15, -1])).times(Mat4.translation([0,0,9]));
        this.timeElement = document.querySelector("#time");
        this.timeNode = document.createTextNode("");
        this.timeElement.appendChild(this.timeNode);
        this.scoreElement = document.querySelector("#score");
        this.scoreNode = document.createTextNode("");
        this.scoreElement.appendChild(this.scoreNode);

      }

    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      { //this.key_triggered_button( "Intial",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.new_line();
        this.key_triggered_button( "Jump",     [ " " ], () => this.jump_bool = 1, undefined, () => this.jump_bool = 0 );
        this.key_triggered_button( "Left",     [ "a" ], () => this.left_bool = 1, undefined, () => this.left_bool = 0 );
        this.key_triggered_button( "Right",     [ "d" ], () => this.right_bool = 1, undefined, () => this.right_bool = 0 );
      }
    bool_draw(i){
            return true;
          //  return this.player_transform[2][3] + 100 >= 14+(i*8) && 14+(i*8) >= this.player_transform[2][3] - 100;
    }

    collision_detected(x_coord, y_coord, z_coord, obstacle_x, obstacle_y, obstacle_z, obstacle_width){
                 if(x_coord-obstacle_width < obstacle_x && x_coord+obstacle_width > obstacle_x ){
                        if(z_coord-obstacle_width < obstacle_z && z_coord+obstacle_width > obstacle_z){
                              if(this.jump_end > 0){ //y_coord >= obstacle_y + 3 && 
                                 // console.log("hit but not y " + y_coord + " jump_time:"+this.jump_end);
                                    return false;
                              }
                              //console.log("hit: " + y_coord + "obstacle y: " + obstacle_y);
                              //console.log(this.jump_end);
                              return true;
                        }
                 }
                 return false;
    }
    game_over(t){
        alert("GAME OVER\nYou survived for: " + t.toFixed(2) + " seconds!");
        document.location.reload();
    }
    draw_path(box_size, row_length, path_length, model_transform, tr_right, graphics_state, t){
      let grey = Color.of(169/255,169/255,169/255, 1);
      let c = 18;
      let cur = 2;

       //draw path
        for(let i = 1; i !== path_length+1; i++){
          for(let j = 1; j !== row_length + 1; j++){
               if(this.player_transform[2][3] + 390 >= 14+(i*c)){

                //NEED TO ADD CODE TO STOP DRAWING PATH AFTER PLAYER HAS PASSED IT While mantaining model_transform




              this.shapes.box.draw( graphics_state, model_transform, this.materials.path); 


            if( i > 7 && ( j % 6 === 3 ) && (i % 10 === 1 || i % 10 === 7 || i%10 === 5) ){
                 model_transform = model_transform.times(Mat4.translation([cur,1.5,0]));
                 if(i%10 === 5){ 
                     model_transform = model_transform.times(Mat4.translation([2,0,0]));
                 }

                
                 //player shrub collision 
                if(this.collision_detected(this.player_transform[0][3], this.player_transform[1][3], this.player_transform[2][3], model_transform[0][3], model_transform[1][3], model_transform[2][3], 6)){
                      this.game_over(t);
                }
                //chaser scrub collision
                if(!(this.chaser_transform[2][3] >= model_transform[2][3] -9  && ((model_transform[0][3] >= 47 && model_transform[0][3] <= 48.2) || (model_transform[0][3] >= 31 && model_transform[0][3] <= 32.3 )))){
          
                    this.shapes.sphere2.draw( graphics_state, model_transform, this.materials.shrub); 
                }

                  cur = -1 * cur;
                 
                  model_transform = model_transform.times(Mat4.translation([cur,-1.5,0]));

                  if(i%10 === 5){
                     model_transform = model_transform.times(Mat4.translation([-2,0,0]));
                  }

            }
           

           //code to spawn rings

           if( i > 7 && ( j % 6 === 3 ))
           {
               //ring spawn 1
               let x = 0;
               if (i % 10 === 0 || i % 10 == 1 || i % 10 == 2)
               {
                   x = 1;
               }
               //ring spawn 2
               if(i % 10 === 3 || i % 10 == 4 || i % 10 == 5)
               {
                   x = -1;
               }
               model_transform = model_transform.times(Mat4.translation([x*1.5, 1.5, 0]));
               model_transform = model_transform.times(Mat4.scale([.05, .05, .05]));
               model_transform = model_transform.times(Mat4.rotation(t, Vec.of(0,1,0)));

               let px = this.player_transform[0][3];
               let mx = model_transform[0][3];
               if( !( (this.player_transform[2][3] >= model_transform[2][3] - 9) && Math.abs(px-mx) <= 1))
              {
                        this.shapes.torus.draw( graphics_state, model_transform, this.materials.ring);
              }
              else if(this.jump_end == 0){
                  console.log("ring");
                 this.main_ring_count = this.main_ring_count + 1;
              }
                 
             
              model_transform = model_transform.times(Mat4.rotation(-t, Vec.of(0,1,0)));
              model_transform = model_transform.times(Mat4.scale([1/.05, 1/.05, 1/.05]));
              model_transform = model_transform.times(Mat4.translation([-1*x*1.5, -1.5, 0]));

           }
            
            //create boundary on edges
            if((j ===1 || j === row_length))
            {
              model_transform = model_transform.times(Mat4.translation([0, tr_right, 0]));

              this.shapes.box.draw( graphics_state, model_transform, this.materials.boundary);

              model_transform = model_transform.times(Mat4.translation([0, -tr_right, 0]));
            }
            model_transform = model_transform.times(Mat4.translation([ tr_right,0, 0]));

          } //for loop for j
          }

           model_transform = model_transform.times(Mat4.translation([tr_right * -1 * row_length, 0, 0]));
           if(i % 110 === 0 || i % 20 === 0 || i % 45 === 0) //create a pit at cycles of 20, 45, and 110
           {
             const pit_start = model_transform[2][3];
             for (let k = 0; k < 3; k++){
               model_transform = model_transform.times(Mat4.translation([0, 0, 2]));
             }
             const pit_end = model_transform[2][3];
            // console.log(pit_start + " : " + pit_end);
             if(i > 7 && pit_start <= this.player_transform[2][3] && this.player_transform[2][3] <= pit_end-16 && this.jump_end == 0){
                         console.log("fell into pit");
                         this.game_over(t);
             }
           }
           else
           {
             model_transform = model_transform.times(Mat4.translation([0, 0, 2]));
           }

        } //for loop for i
    }

    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        let t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
        const p_t = graphics_state.animation_time;


        this.timeNode.nodeValue = t.toFixed(2);
        this.scoreNode.nodeValue = this.main_ring_count;

        //this.main_ring_count = this.ring_count;

        //define constants
        const box_size = 8;
        const row_length = 6;
        const path_length = 500;

        let model_transform = Mat4.identity().times(Mat4.scale([box_size, box_size, box_size]));
        const tr_right = 2; 
        
        //draw_path
       // this.start_i = this.start_i + t/8000;
        //console.log(this.start_i);
        this.draw_path(box_size, row_length, path_length, model_transform, tr_right, graphics_state, t);
 

        //draw chaser
          const chaser_speed = 17*dt;
          this.chaser_transform = this.chaser_transform.times(Mat4.translation([0,0, chaser_speed]));
          this.camera_model_transform = this.camera_model_transform.times(Mat4.translation([0,0, -1*chaser_speed]));

          this.chaser_transform = this.chaser_transform.times(Mat4.rotation(dt, Vec.of(0,0,1) ));
          this.shapes.sphere2.draw(graphics_state, this.chaser_transform.times(Mat4.scale([4,4,4])), this.materials.chaser);


       //draw player
          let jump_height = 18;
          const movement_time = 0.7;
          const player_speed = chaser_speed;

          //jump activated
          if(this.jump_bool===1 && !(this.jump_end > t)){
               this.jump_end = t + movement_time;
               //this.jump_bool = 0;
//                console.log("Jump");
          }
          if(this.jump_end > t){
            this.player_transform = this.player_transform.times(Mat4.translation([0, jump_height*((this.jump_end-t)/movement_time), 5]));
            this.shapes.box.draw(graphics_state, this.player_transform.times(Mat4.scale([1,3,1])), this.materials.player);
            this.player_transform = this.player_transform.times(Mat4.translation([0, -1* jump_height*((this.jump_end-t)/movement_time), 0]));
            //this.shapes.box.draw(graphics_state, this.player_transform.times(Mat4.scale([1,3,1])), this.materials.player);
            this.chaser_transform = this.chaser_transform.times(Mat4.translation([0,0,5]));
            this.camera_model_transform = this.camera_model_transform.times(Mat4.translation([0,0,-5]));
            this.player_transform = this.player_transform.times(Mat4.translation([0,0,player_speed]));
            this.jump_bool = 0;
          }


          //move left
          else if(this.left_bool && !(this.left_end > t)  && this.player_left_limit < this.player_transform[0][3]){
            this.left_end = t + movement_time - 0.4;
          //  console.log("Left");
            this.left_bool = 0;
            this.player_transform = this.player_transform.times(Mat4.translation([0,0,player_speed]));
            this.shapes.box.draw(graphics_state, this.player_transform.times(Mat4.scale([1,3,1])), this.materials.player);
          }

          else if(this.left_end > t){
            this.player_transform = this.player_transform.times(Mat4.translation([-1.2*((this.left_end-t)/movement_time), 0, 0]));
            this.player_transform = this.player_transform.times(Mat4.translation([0,0,player_speed]));
            this.shapes.box.draw(graphics_state, this.player_transform.times(Mat4.scale([1,3,1])), this.materials.player);
          }

          //move right
          else if(this.right_bool && !(this.right_end > t) && this.player_right_limit > this.player_transform[0][3]){
              this.right_end = t + movement_time - 0.4;
             // console.log("Right");
              this.right_bool = 0;
              this.player_transform = this.player_transform.times(Mat4.translation([0,0,player_speed]));
              this.shapes.box.draw(graphics_state, this.player_transform.times(Mat4.scale([1,3,1])), this.materials.player);
          }

          else if(this.right_end > t){
              this.player_transform = this.player_transform.times(Mat4.translation([1.2*((this.right_end-t)/movement_time), 0, 0]));
              this.player_transform = this.player_transform.times(Mat4.translation([0,0,player_speed]));
              this.shapes.box.draw(graphics_state, this.player_transform.times(Mat4.scale([1,3,1])), this.materials.player);
          }

          else{
              this.player_transform = this.player_transform.times(Mat4.translation([0,0,player_speed]));
              this.shapes.box.draw(graphics_state, this.player_transform.times(Mat4.scale([1,3,1])), this.materials.player);
              this.jump_end = 0;
          }


        //camera position
          this.camera = this.camera_model_transform;

        //Attach camera
          let desired = Mat4.inverse(this.camera.times(Mat4.translation([0,0,5])));
          desired = desired.times(Mat4.scale([1,1,-1]));
          desired = desired.times(Mat4.translation([0,-10,4]));
          //desired = desired.times(Mat4.translation([0,0,chaser_speed]));
          desired = desired.map((x, i) => Vec.from( graphics_state.camera_transform[i]).mix(x, .1));
          graphics_state.camera_transform = desired;

      }
  }



class Texture_Rotate extends Phong_Shader {
  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #7.
    return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          vec4 tex_color = texture2D( texture, f_tex_coord );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
  }
}