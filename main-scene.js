window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,10,20 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );
        this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { torus:  new Torus( 15, 15 ),
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
              Color.of(1,0,0,1), 
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
    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        

        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 2 and 3)
        let model_transform = Mat4.identity();

        //1. draw sun
        let sun_transform =model_transform;
        let sun_period = 5;
        let sun_size = 2 + Math.sin(2*t*Math.PI/sun_period); //go from 1->3->1 in sun_period time
        sun_transform = sun_transform.times(Mat4.scale([sun_size, sun_size, sun_size]));
        this.shapes.sphere4.draw(graphics_state, sun_transform, this.materials.sun.override({color:Color.of(.5 + .5 * Math.sin(.4 * Math.PI * t), 0, .5 -.5 * Math.sin(.4 * Math.PI * t), 1)}));


        //2. Point light source in center of sun
        this.lights = [new Light(Vec.of(0,0,0,1), Color.of( .5 + .5 * Math.sin(.4 * Math.PI * t), 0, .5 - .5 * Math.sin(.4 * Math.PI * t), 1 ), 10**sun_size) ];
    
        
        //Planet 1
        let model_transform_1 = Mat4.identity();
        model_transform_1 = model_transform_1.times(Mat4.rotation(t + 1, Vec.of(0, 1, 0))).times(Mat4.translation([5, 0, 0])).times(Mat4.rotation(t*2, Vec.of(1, 0, 0)));
        this.shapes.sphere2.draw(graphics_state, model_transform_1, this.materials.planet_1);
        this.planet_1 = model_transform_1;


        //Planet 2
        let model_transform_2 = Mat4.identity();
        model_transform_2 = model_transform_2.times(Mat4.rotation(t*0.9 + 0.8, Vec.of(0, 1, 0))).times(Mat4.translation([8, 0, 0])).times(Mat4.rotation(t*2, Vec.of(1, 0, 0)));
        const whole_t = Math.floor(t);
        if(whole_t % 2 == 0){
          this.shapes.sphere3.draw(graphics_state, model_transform_2, this.materials.planet_2); //regular smooth shading
        }
        else{
           this.shapes.sphere3.draw(graphics_state, model_transform_2, this.materials.planet_2.override({gouraud: 1})); //gouraud shading
        }
        this.planet_2 = model_transform_2;
  
        
        //Planet 3 (Wobble)
        let model_transform_3 = Mat4.identity();
        model_transform_3 = model_transform_3.times(Mat4.rotation(t*0.8 + 0.6, Vec.of(0, 1, .3))).times(Mat4.translation([11, 0, 6])).times(Mat4.rotation(t*2, Vec.of(1, 0, 0)));
        this.shapes.sphere4.draw(graphics_state, model_transform_3, this.materials.planet_3);
        this.shapes.torus.draw(graphics_state, model_transform_3.times(Mat4.scale([1, 1, .01])), this.materials.planet_3);
        this.planet_3 = model_transform_3;

        //Planet 4
        let model_transform_4 = Mat4.identity();
        let model_transform_5 = model_transform_4.times(Mat4.translation([1.5, 0, 0]))
        model_transform_4 = model_transform_4.times(Mat4.rotation(t*0.7 + 0.4, Vec.of(0, 1, 0))).times(Mat4.translation([14, 0, 0])).times(Mat4.rotation(t*2, Vec.of(1, 0, 0)));
        model_transform_5 = model_transform_5.times(model_transform_4).times(Mat4.scale([.5,.5,.5]));
        this.shapes.sphere4.draw(graphics_state, model_transform_4, this.materials.planet_4);
        this.shapes.sphere1.draw(graphics_state, model_transform_5, this.materials.planet_4);
        this.planet_4 = model_transform_4;
        this.moon = model_transform_5;

        //Attach camera 
        
         if(this.attached != undefined) {
          var desired = Mat4.inverse(this.attached().times(Mat4.translation([0,0,5]))); 
          desired = desired.map((x, i) => Vec.from( graphics_state.camera_transform[i]).mix(x, .1));
          graphics_state.camera_transform = desired;
        }
        
        /*
        if(this.attached === this.initial_camera_location){
          let camera_matrix = this.attached;
          graphics_state.camera_transform = Mat4.inverse(camera_matrix)
            .map((x, i)=> Vec.from(graphics_state.camera_transform[i]).mix(x, .1));
        } else if(this.attached != undefined) {
                    let camera_matrix = this.attached;
          let camera_planet_transform = Mat4.translation([0,0,-5]).times(Mat4.inverse(camera_matrix));
          graphics_state.camera_transform = camera_planet_transform.map((x, i)=> Vec.from(graphics_state.camera_transform[i]).mix(x, .1));
        }
        */
       
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