// Data sources
const CountyData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
const EducationData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

// Reference: https://www.d3-graph-gallery.com/graph/choropleth_basic.html
const MapData = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
const PopulationData = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv";

// The svg
const width = 400;
const height = 300;
const svg = d3.select("#canvas")
               .attr("width", width)
               .attr("height", height);
   //width = +svg.attr("width"),
   //height = +svg.attr("height");

// Map and projection
const path = d3.geoPath();
const projection = d3.geoMercator()
                     // Set how big the map will appear
                     .scale(70)
                     .center([0,20])
                     .translate([width / 2, height / 2]);

// Data and color scale
const data = d3.map();
// Assign different colors for different values
const colorScale = d3.scaleThreshold()
                     .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
                     .range(d3.schemeBlues[7]);

// Load external data and boot
d3.queue()
   // Load map data
   .defer(d3.json, MapData)
   // Load population data
   .defer(d3.csv, PopulationData, (d) => {
         data.set(d.code, +d.pop);
      }
   )
   .await(ready);

// **Create dummy tooltip element as requested, must be hidden by default
const setTooltip = d3.select("#tooltip")
                     .style("visibility", "hidden")
                     .style("width", "auto")
                     .style("height", "auto");

function ready(error, topo) {

   console.log(topo.features);
   // Draw the map
   svg.append("g")
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
      // draw each country
      .attr("d", d3.geoPath()
         .projection(projection)
      )
      // 3. Choropleth should have counties with a corresponding class="county" that represent the data
      .attr("class","county")
      // 5. Adding the requested property into each element
      .attr( "data-fips", (d, i) => d )
      .attr( "data-education", (d, i) => d )
      // set the color of each country
      .attr("fill", (d) => {
         d.total = data.get(d.id) || 0;
         return colorScale(d.total);
      })
      // ** Make dummy #tooltip element visible as requested using .on()
      .on("mouseover", (d) => {
         setTooltip.transition()
                     .style("visibility", "visible")
                     // Won't actually display on web page
                     .text("")
                     //attr doesn't work, you need to use vanilla JS:
         // Use <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.2/d3.min.js"></script>
         return document.querySelector("#tooltip").setAttribute("data-education", d.education);
      })
      // Hide dummy #tooltip element when mouseout
      .on("mouseout", (d) => {
         setTooltip.transition()
                     .style("visibility", "hidden")
      })
      ;
}