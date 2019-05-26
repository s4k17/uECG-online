class Plot_grid {
  //this.line_points_gl_buff;
  //var this.line_points_f32 = [];
  //var line_points = new Array();

  calc_grid_points(){
    var temp_canvas_size;

    if(this.direction == "horisontal" || this.direction == 1){
      temp_canvas_size =  this.canvas.width;
    }
    else temp_canvas_size = this.canvas.height;

    for(var i = 0; i < temp_canvas_size; i += this.size){
      this.line_points.push( i - 8.5);
      this.line_points.push( 1024 );

      this.line_points.push( i - 8.5 );
      this.line_points.push( 0 );
    }

    this.line_points_f32 = new Float32Array(this.line_points);
  }

  constructor(canvas, grid_size, width, direction) {
    this.canvas = canvas;
    this.size = grid_size;
    this.line_width = width;
    this.direction = direction;
    console.log( "init plot grid: line_width = " + this.line_width + ", size = " + this.size );

    this.calc_grid_points();
  }

}
