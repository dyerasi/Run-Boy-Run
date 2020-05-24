window.Cube = window.classes.Cube =
class Cube extends Shape                 // Here's a complete, working example of a Shape subclass.  It is a blueprint for a cube.
  { constructor()
      { super( "positions", "normals" ); // Name the values we'll define per each vertex.  They'll have positions and normals.

        // First, specify the vertex positions -- just a bunch of points that exist at the corners of an imaginary cube.
        this.positions.push( ...Vec.cast( [-1,-1,-1], [1,-1,-1], [-1,-1,1], [1,-1,1], [1,1,-1],  [-1,1,-1],  [1,1,1],  [-1,1,1],
                                          [-1,-1,-1], [-1,-1,1], [-1,1,-1], [-1,1,1], [1,-1,1],  [1,-1,-1],  [1,1,1],  [1,1,-1],
                                          [-1,-1,1],  [1,-1,1],  [-1,1,1],  [1,1,1], [1,-1,-1], [-1,-1,-1], [1,1,-1], [-1,1,-1] ) );
        // Supply vectors that point away from eace face of the cube.  They should match up with the points in the above list
        // Normal vectors are needed so the graphics engine can know if the shape is pointed at light or not, and color it accordingly.
        this.normals.push(   ...Vec.cast( [0,-1,0], [0,-1,0], [0,-1,0], [0,-1,0], [0,1,0], [0,1,0], [0,1,0], [0,1,0], [-1,0,0], [-1,0,0],
                                          [-1,0,0], [-1,0,0], [1,0,0],  [1,0,0],  [1,0,0], [1,0,0], [0,0,1], [0,0,1], [0,0,1],   [0,0,1],
                                          [0,0,-1], [0,0,-1], [0,0,-1], [0,0,-1] ) );

                 // Those two lists, positions and normals, fully describe the "vertices".  What's the "i"th vertex?  Simply the combined
                 // data you get if you look up index "i" of both lists above -- a position and a normal vector, together.  Now let's
                 // tell it how to connect vertex entries into triangles.  Every three indices in this list makes one triangle:
        this.indices.push( 0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
                          14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22 );
        // It stinks to manage arrays this big.  Later we'll show code that generates these same cube vertices more automatically.
      }
  }

window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
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


        const shapes = {
                         box: new Cube(),
                         sphere2: new (Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
                         sphere3: new (Subdivision_Sphere)(3),
                         sphere4: new (Subdivision_Sphere)(4)
                       }

        this.submit_shapes( context, shapes );
                                     
                                     // Make some Material objects available to you:
        this.materials =
          { test:     context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), { ambient:.2 } ),

            path: context.get_instance(Phong_Shader).material(
              Color.of(1,0,1,1),
              {ambient:1}
            ),

            player: context.get_instance(Phong_Shader).material(
              Color.of(0.678, 0.847, 0.902, 1), //soft light blue
              {specularity: 1},
              {ambient: 1}
            ),
          }

        this.lights = [ new Light( Vec.of( 5,-10,5,1 ), Color.of( 0, 1, 1, 1 ), 1000 ) ];
      }

    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      { //this.key_triggered_button( "Intial",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.new_line();
        this.key_triggered_button( "Jump",     [ " " ], () => this.jump_bool = 0, undefined, () => this.jump_bool = 1 );
        this.key_triggered_button( "Left",     [ "a" ], () => this.left_bool = 0, undefined, () => this.left_bool = 1 );
        this.key_triggered_button( "Right",     [ "s" ], () => this.right_bool = 0, undefined, () => this.right_bool = 1 );
      }

    draw_path(box_size, row_length, path_length, model_transform, tr_right, graphics_state){
      let grey = Color.of(169/255,169/255,169/255, 1);
      const t = graphics_state.animation_time / 1000;
       
       //draw path
        for(let i = 1; i !== path_length+1; i++){
          for(let j = 1; j !== row_length + 1; j++){
            this.shapes.box.draw( graphics_state, model_transform, this.materials.path.override({color: grey}));
            //create boundary on edges
            if((j ===1 || j === row_length))
            {
              model_transform = model_transform.times(Mat4.translation([0, tr_right, 0]));
              this.shapes.box.draw( graphics_state, model_transform, this.materials.path.override({color: Color.of(.5 + .5 * Math.sin(i * Math.PI * t), 0, .5 -.5 * Math.sin(j * Math.PI * t), 1)}));
              model_transform = model_transform.times(Mat4.translation([0, -tr_right, 0]));
            }
            model_transform = model_transform.times(Mat4.translation([ tr_right,0, 0]));

          } //for loop for j
           model_transform = model_transform.times(Mat4.translation([tr_right * -1 * row_length, 0, 0]));
           if(i % 110 === 0 || i % 20 === 0 || i % 45 === 0) //create a pit at cycles of 20, 45, and 100
           {
             for (let k = 0; k < 3; k++)
               model_transform = model_transform.times(Mat4.translation([0, 0, 2]));
           }
           else
           {
             model_transform = model_transform.times(Mat4.translation([0, 0, 2]));
           }

        } //for loop for i
    }

    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        //define constants
        const box_size = 8;
        const row_length = 6;
        const path_length = 100;

        let model_transform = Mat4.identity().times(Mat4.scale([box_size, box_size, box_size]));
        const tr_right = 2; 
        
        //draw_path
        this.draw_path(box_size, row_length, path_length, model_transform, tr_right, graphics_state);


        //draw chaser
          let chaser_transform = Mat4.identity();
          chaser_transform = chaser_transform.times(Mat4.translation([40, 15, -1]));
          const player_model_transform = chaser_transform.times(Mat4.translation([0, 0, 10]));
          //chaser_transform = chaser_transform.times(Mat4.scale([4,4,4]));
          let camera_model_transform = chaser_transform.times(Mat4.translation([0,0,9]));
          const chaser_speed = 5*t;
          chaser_transform = chaser_transform.times(Mat4.translation([0,0, chaser_speed]));
          chaser_transform = chaser_transform.times(Mat4.rotation(8*t, Vec.of(1,0,0) ));
          chaser_transform = chaser_transform.times(Mat4.scale([4,4,4]));

          this.shapes.sphere2.draw(graphics_state, chaser_transform, this.materials.path);


       //draw player
       /*
          if(this.jump_end == undefined){
            this.jump_end = 0;
          }
          */
          let player_transform = player_model_transform;
          let jump_height = 5;
          const movement_time = .5;
          //jump activated
          if(this.jump_bool && !(this.jump_end > t)){
               this.jump_end = t + movement_time;
               this.jump_bool = 0;
//                console.log("Jump");
          }
          if(this.jump_end > t){
            //let t_ex = 1 + Math.cos(Math.pi/2+ (movement_time-(this.jump_end-t)) * Math.pi*2/movement_time );
            //console.log(this.t_ex);
            player_transform = player_transform.times(Mat4.translation([0, jump_height*((this.jump_end-t)/movement_time), 0]));
          }

          //move left
          if(this.left_bool && !(this.left_end > t)){
            this.left_end = t + movement_time;
            console.log("Left");
            this.left_bool = 0;
          }
          if(this.left_end > t){
            player_transform = player_transform.times(Mat4.translation([-9*((this.left_end-t)/movement_time), 0, 0]));
          }
          //move right
          if(this.right_bool && !(this.right_end > t)){
            this.right_end = t + movement_time;
            console.log("Right");
            this.right_bool = 0;
          }
          if(this.right_end > t){
            player_transform = player_transform.times(Mat4.translation([9*((this.right_end-t)/movement_time), 0, 0]));
          }
          
          player_transform = player_transform.times(Mat4.translation([0,0,5]));
          const player_speed = chaser_speed + 5;
          player_transform = player_transform.times(Mat4.translation([0,0,player_speed]));
          player_transform = player_transform.times(Mat4.scale([1,3,1]));

          this.shapes.box.draw(graphics_state, player_transform, this.materials.player);

        // ***Camera Calculations***
        //camera position
          this.planet_1 = camera_model_transform;

        //Attach camera
          let desired = Mat4.inverse(this.planet_1.times(Mat4.translation([0,0,5])));
          desired = desired.times(Mat4.scale([1,1,-1]));
          desired = desired.times(Mat4.translation([0,-10,4]));
          desired = desired.times(Mat4.translation([0,0,-1*chaser_speed]));
          desired = desired.map((x, i) => Vec.from( graphics_state.camera_transform[i]).mix(x, .1));
          graphics_state.camera_transform = desired;

      }
  }
