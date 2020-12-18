// Check if scripts were imported correctly
//console.log(d3)
//console.log(topojson)

// Data sources
const CountyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
const EducationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

// Function for plotting the chart
const plotChart = (countyData, educationData) => {

   // Create svg canvas
   const svgWidth = 960;
   const svgHeight = 600;
   // <svg> id cannot have "-"
   const canvas = d3.select("#canvas")
                  .attr("width", svgWidth)
                  .attr("height", svgHeight);

   // Create dummy tooltip element as requested, must be hidden by default
   const setTooltip = d3.select("#tooltip")
                        .style("visibility", "hidden");

   // Select all svg path elements
   canvas.selectAll("path")
         // Put data into the waiting state for further processing
         .data(countyData)
         // Methods chained after data() run once per item in dataset
         // Create new element for each piece of data
         .enter()
         // The following code will be ran for each data point
         // Append new path to draw every county
         .append("path")
         // Feed data in the correct format for svg to draw the path
         .attr("d", d3.geoPath())
         // 3. Choropleth should have counties with a corresponding class="county" that represent the data
         .attr("class", "county")
         // 4. There should be at least 4 different fill colors used for the counties
         .attr("fill", (d) => {
            let countyId = d["id"];
            // Get bachelorsOrHigher for each county based on fips
            let educationCounty = educationData.find( (d) => {
               return (d["fips"] === countyId);
            });
            //console.log(educationCounty);
            let pctUniEd = educationCounty["bachelorsOrHigher"];
            // Monochromatic Color Scheme from https://www.w3schools.com/colors/colors_monochromatic.asp
            if(pctUniEd <= 20) {
               return "#C4D4FF";
            } else if(pctUniEd <= 40) {
               return "#5884FE";
            } else if(pctUniEd <= 60) {
               return "#0141F1";
            } else if(pctUniEd <= 80) {
               return "#012589";
            } else {
               return "#091431";
            }
         })
         // 5. Counties should each have "data-fips" and "data-education" properties containing their corresponding fips and education values
         .attr( "data-fips", (d, i) => d["id"] )
         .attr( "data-education", (d, i) => {
            // Get countyData.id, which is the same as educationData.fips
            let countyId = d["id"];
            // Find corresponding educationData properties based on fips (e.g. educationData.bachelorsOrHigher)
            let educationCounty = educationData.find( (d) => {
               // If matches countyData.id, then return it
               return (d["fips"] === countyId);
            });
            return educationCounty["bachelorsOrHigher"];
         })
         // Make dummy #tooltip element visible as requested using .on()
         .on("mouseover", (d) => {
            setTooltip.transition()
                        .style("visibility", "visible")
            let countyId = d["id"];
            // Get bachelorsOrHigher for each county based on fips
            let educationCounty = educationData.find( (d) => {
               return (d["fips"] === countyId);
            });
            setTooltip.attr("data-education", educationCounty["bachelorsOrHigher"])
                        //.text(`${educationCounty["bachelorsOrHigher"]}%`);
         })
         // Hide dummy #tooltip element when mouseout
         .on("mouseout", (d) => {
            setTooltip.transition()
                        .style("visibility", "hidden");
         })
         // This is the actual tooltip to display data value when hover mouse on bar,
         // but unfortunately this doesn't pass the tests for some reason
         .append("title")
         // Specifying the text to display upon mouseover the data point
         //.text("display this text")
         .text((d) => {
            let countyId = d["id"];
            let educationCounty = educationData.find( (d) => {
               return (d["fips"] === countyId);
            });
            // Setting what text to display when mouseover
            return `${educationCounty["area_name"]} (${educationCounty["state"]}): ${educationCounty["bachelorsOrHigher"]}%`;
         });

   // Legend
   // svg legend width set to 800px
   const legendData = [0, 20, 40, 60, 80, 100];
   const lgdWidth = 350;
   const lgdHeight = 40;
   const lgdPadding = 40;
   const lgdBarWidth = 40;
   const lgdBarHeight = 20;
   // Select legend svg element
   const lgdContainer = d3.select("#legend")
                           .style("width", lgdWidth)
                           .style("height", lgdHeight)

   // Scale legend x axis width
   const legendXAxisScale = d3.scaleLinear()
                              // Start from earliest date & end at latest date
                              .domain([d3.min(legendData), d3.max(legendData)])
                              // Display x axis starting from left to right
                              .range([2*lgdPadding, (legendData.length+1)*lgdPadding]);
   // Generate x-axis for legend
   const legendXAxis = d3.axisBottom(legendXAxisScale)
   // Move x-axis downwards
   const legendXAxisTranslate = 0.5*lgdPadding; 
   // Create g element within lgdContainer for x-axis
   const gLegendXAxis = lgdContainer.append("g")
                                    .call(legendXAxis)
                                    // Move axis downwards, otherwise will be at top of the svg
                                    .attr("transform", `translate(0, ${legendXAxisTranslate})`);

   // Create rectangle svg shapes for legend color
   const createLegend = lgdContainer.selectAll("rect")
                                    // Put data into the waiting state for further processing
                                    .data(legendData)
                                    // Methods chained after data() run once per item in dataset
                                    // Create new element for each piece of data
                                    .enter()
                                    // The following code will be ran for each data point
                                    // Append rect for each data element
                                    .append("rect")
                                    // Shift x position of <rect> by lgdBarWidth for each data point
                                    .attr("x", (d, i) => lgdPadding + i*lgdBarWidth)
                                    .attr("y", 0)
                                    .attr("width", lgdBarWidth)
                                    .attr("height", lgdBarHeight)
                                    // Fill bar with color based on data value
                                    .attr("fill", (d) => {
                                       if(d <= 0) {
                                          return "#FFF"; // White
                                       } else if(d <= 20) {
                                          return "#C4D4FF";
                                       } else if(d <= 40) {
                                          return "#5884FE";
                                       } else if(d <= 60) {
                                          return "#0141F1";
                                       } else if(d <= 80) {
                                          return "#012589";
                                       } else {
                                          return "#091431";
                                       }
                                    })

};

//"Producing code" is code that can take some time
//"Consuming code" is code that must wait for the result
//A Promise is a JavaScript object that links producing code and consuming code

// Use async functions and the await keyword, part of the so-called ECMAScript 2017 JavaScript edition
// the "async" keyword is added to functions to tell them to return a promise rather than directly returning the value
const fetchData = async () => {

   // "await" only works inside async functions
   // This can be put in front of any async promise-based function to pause your code on that line until the promise fulfills,
   // then return the resulting value
   const countyResp = await fetch(CountyURL);
   const eduResp = await fetch(EducationURL);

   // Throw error if response is not ok
   if (!countyResp.ok || !eduResp.ok) {
      throw new Error(`HTTP error! status: ${countyResp.status} ${eduResp.status}`);
   } else {
      // Convert the response to JSON format
      const counties = await countyResp.json();
      const education = await eduResp.json();
      
      // Convert from TopoJSON with "topology" into GeoJSON format to get "features"
      let countyData = topojson.feature(counties, counties["objects"]["counties"]);
      console.log(countyData);
      countyData = countyData["features"];
      // or countyData = topojson.feature(countyD, countyD.objects.counties).features;
      console.log(countyData);

      let educationData = education;
      console.log(educationData);

      // Call plot chart function
      plotChart(countyData, educationData);
   }
   
}

// Run everything
fetchData()
   .catch( e => {
      console.log('There has been a problem with your fetch operation: ' + e.message);
});