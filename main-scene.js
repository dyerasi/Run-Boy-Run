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
//35.05, 18.71, 181.73
//37.5, 50,200
        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 36.59, 20.14, -40.49 ), Vec.of( 1,0,-3 ), Vec.of( 0,1,0 ) );
        this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { 
                        box: new Cube(),
                        torus:  new Torus( 15, 15 ),
                         torus2: new ( Torus.prototype.make_flat_shaded_version() )( 15, 15 ),
 
                                // TODO:  Fill in as many additional shape instances as needed in this key/value table.
                                //        (Requirement 1)
                         sphere1: new (Subdivision_Sphere.prototype.make_flat_shaded_version())(1),
                         sphere2: new (Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
                         sphere3: new (Subdivision_Sphere)(3),
                         sphere4: new (Subdivision_Sphere)(4)
                       }
        this.submit_shapes( context, shapes );
                                     
                                     // Make some Material objects available to you:
        this.materials =
          { test:     context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), { ambient:.2 } ),
            ring:     context.get_instance( Ring_Shader  ).material(),

                                // TODO:  Fill in as many additional material objects as needed in this key/value table.
                                //        (Requirement 1)
                                
            sun: context.get_instance(Phong_Shader).material( 
              Color.of(1,0,1,1),
              {ambient:1}
            ),
            planet_1: context.get_instance(Phong_Shader).material(
              Color.of(221/255, 238/255, 245/255, 1), //Ice-grey/Azureish White
              {ambient: 0}, 
              {diffusivity: 1},
              {specularity: 0}
            ),
            planet_2: context.get_instance(Phong_Shader).material(
              Color.of(65/255, 104/255, 37/255, 1), //Swampy green-blue
              {ambient:  0},  //CHANGE THIS AFTER TESTING!!!!!
              {diffusivity: 0.2},
              {specularity: 1}
            ),
           planet_3: context.get_instance(Phong_Shader).material(
              Color.of(0.7843, 0.3922, 0.0431, 1), //muddy brown orange
              {ambient:  0},  //CHANGE THIS AFTER TESTING!!!!!
              {diffusivity: 1},
              {specularity: 1}
            ),
           planet_4: context.get_instance(Phong_Shader).material(
              Color.of(0.678, 0.847, 0.902, 1), //soft light blue
              {specularity: 1},
              {ambient: 0}
            ),
          
          }

        this.lights = [ new Light( Vec.of( 5,-10,5,1 ), Color.of( 0, 1, 1, 1 ), 1000 ) ];
      }
    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      { this.key_triggered_button( "View solar system",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.new_line();
        this.key_triggered_button( "Attach to planet 1", [ "1" ], () => this.attached = () => this.planet_1 );
        this.key_triggered_button( "Attach to planet 2", [ "2" ], () => this.attached = () => this.planet_2 ); this.new_line();
        this.key_triggered_button( "Attach to planet 3", [ "3" ], () => this.attached = () => this.planet_3 );
        this.key_triggered_button( "Attach to planet 4", [ "4" ], () => this.attached = () => this.planet_4 ); this.new_line();
        this.key_triggered_button( "Attach to planet 5", [ "5" ], () => this.attached = () => this.planet_5 );
        this.key_triggered_button( "Attach to moon",     [ "m" ], () => this.attached = () => this.moon     );
      }
    draw_path(box_size, row_length, path_length, model_transform, tr_right, graphics_state){
      let grey = Color.of(169/255,169/255,169/255, 1);
      let yellow = Color.of(1,1,0,1);
      const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
       
       //draw path
       

        for(var i = 1; i != path_length+1; i++){
          for(var j = 1; j != row_length + 1; j++){
<<<<<<< HEAD
            //this.shapes.box.draw( graphics_state, model_transform, this.materials.sun.override({color:Color.of(.5 + .5 * Math.sin(i * Math.PI * t), 0, .5 -.5 * Math.sin(j * Math.PI * t), 1)})); 
              this.shapes.box.draw( graphics_state, model_transform, this.materials.sun.override({color:Color.of(.5, .5, .5, 1)})); 

=======
            this.shapes.box.draw( graphics_state, model_transform, this.materials.sun.override({color: grey}));
           
>>>>>>> master
            //create boundary on edges
            if((j ==1 || j == row_length))
            {
             

              model_transform = model_transform.times(Mat4.translation([0, tr_right, 0]));
<<<<<<< HEAD

              
              this.shapes.box.draw( graphics_state, model_transform, this.materials.sun.override({color:Color.of(.5 + .5 * Math.sin(i * Math.PI * t), 0, .5 -.5 * Math.sin(j * Math.PI * t), 1)})); 
=======
              this.shapes.box.draw( graphics_state, model_transform, this.materials.sun.override({color: Color.of(.5 + .5 * Math.sin(i * Math.PI * t), 0, .5 -.5 * Math.sin(j * Math.PI * t), 1)}));
>>>>>>> master
              model_transform = model_transform.times(Mat4.translation([0, -tr_right, 0]));


            }

           
            model_transform = model_transform.times(Mat4.translation([ tr_right,0, 0]));
            

          } //for loop for j
           model_transform = model_transform.times(Mat4.translation([tr_right * -1 * row_length, 0, 0]));

            
           if(i % 110 == 0 || i % 20 == 0 || i % 45 == 0) //create a pit at cycles of 20, 45, and 100
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
        const blue = Color.of( 0,0,1,1 ), yellow = Color.of( 1,1,0,1 );
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

          this.shapes.sphere2.draw(graphics_state, chaser_transform, this.materials.sun);


       //draw player
          let player_transform = player_model_transform;
          player_transform = player_transform.times(Mat4.translation([0,0,5]));
          const player_speed = chaser_speed + 5;
          player_transform = player_transform.times(Mat4.translation([0,0,player_speed]));
          player_transform = player_transform.times(Mat4.scale([1,3,1]));

          this.shapes.box.draw(graphics_state, player_transform, this.materials.planet_4);

        //camera position
          this.planet_1 = camera_model_transform;


        //Attach camera

          var desired = Mat4.inverse(this.planet_1.times(Mat4.translation([0,0,5])));
          desired = desired.times(Mat4.scale([1,1,-1]));
          desired = desired.times(Mat4.translation([0,-10,4]));
          desired = desired.times(Mat4.translation([0,0,-1*chaser_speed]));
          desired = desired.map((x, i) => Vec.from( graphics_state.camera_transform[i]).mix(x, .1));
          graphics_state.camera_transform = desired;

      }
  }


// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
class Ring_Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       // The shader will pull single entries out of the vertex arrays, by their data fields'
    {                                             // names.  Map those names onto the arrays we'll pull them from.  This determines
                                                  // which kinds of Shapes this Shader is compatible with.  Thanks to this function, 
                                                  // Vertex buffers in the GPU can get their pointers matched up with pointers to 
                                                  // attribute names in the GPU.  Shapes and Shaders can still be compatible even
                                                  // if some vertex data feilds are unused. 
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );
                                                                                        // Send our matrices to the shader programs:
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
        }`;           // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return `
        void main()
        { 
        }`;           // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    }
}

window.Grid_Sphere = window.classes.Grid_Sphere =
class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at 
  { constructor( rows, columns, texture_range )             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
      { super( "positions", "normals", "texture_coords" );
        

                      // TODO:  Complete the specification of a sphere with lattitude and longitude lines
                      //        (Extra Credit Part III)
      } }