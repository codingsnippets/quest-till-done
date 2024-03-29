function buildTree(treeData) {
    var i = 0, duration = 750;
    // Create a svg canvas
    var height = 800;
    var width = 800;
    var svg = d3.select("#tree-container").append("svg:svg")
       // .attr("width", width)
        //.attr("height", height)
        .append("g")
        .attr("transform", "translate(100, 0)"); // shift everything to the right

    // Create a tree "canvas"
    var tree = d3.layout.tree()
        .size([height,width])

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });


    // Preparing the data for the tree layout, convert data into an array of nodes
    var nodes = tree.nodes(treeData);
    // Create an array with all the links
    var links = tree.links(nodes);

    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("svg:path")
        .attr("class", "link")
        .attr("d", diagonal)

    var node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("svg:g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

    // Add the dot at every node
    node.append("svg:circle")
        .attr("r", 5.5)
        .on("click", nodeClick)
        .each(function(d)
        {
            $(this).popover({
                'trigger': 'hover',
                'title': d.attr.name,
                'content': d.attr.description,
                'container': '#tree-container'
            }).popover();
        });

    // place the name atribute left or right depending if children
    node.append("svg:text")
        .attr("dx", function(d) { return d.children ? -8 : 8; })
        .attr("dy", 3)
        .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
        .text(function(d) { return d.attr.name; })
        .on("click", nodeClick)
        .each(function(d)
        {
            $(this).popover({
                'trigger': 'hover',
                'title': d.attr.name,
                'content': d.attr.description,
                'container': '#tree-container'
            }).popover();
        });

    node.append("svg:foreignObject")
        .attr("y",8)
        .attr("x", function(d) { return d.children ? -50 : 10; })
        .attr("width", 70)
        .attr("height", 22)
        .attr("class", "text")
        .append("xhtml:body")
        .html(function(d) {
            if(d.attr.status != "undefined" && d.attr.status != null) {
                var css = d.attr.status.toString().trim().replace(/ /g,'');
                return "<span class='label label-"+ css+"'>"+ d.attr.status +"</span>";
            }
        });
}

function nodeClick(d) {
    window.location.href =  d.attr.url;
}

function buildTreeRadial(treeData)
{

// Create a svg canvas
    var height = 800;
    var width = 800;
    var diameter = 800;
    var vis = d3.select("#tree-container").append("svg:svg")
        .attr("width", diameter)
        .attr("height", diameter - 150)
        .append("g")
        .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");


// Create a tree "canvas"
    var tree = d3.layout.tree()
        .size([360, diameter / 2 - 120])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    var diagonal = d3.svg.diagonal.radial()
        .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });


// Preparing the data for the tree layout, convert data into an array of nodes
    var nodes = tree.nodes(treeData);
// Create an array with all the links
    var links = tree.links(nodes);

    var link = vis.selectAll(".link")
        .data(links)
        .enter().append("svg:path")
        .attr("class", "link")
        .attr("d", diagonal)

    var node = vis.selectAll(".node")
        .data(nodes)
        .enter().append("svg:g")
        .attr("class", "node")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

// Add the dot at every node
    node.append("svg:circle")
        .attr("r", 5.5);

// place the name atribute left or right depending if children
    node.append("svg:text")
        .attr("dy", ".31em")
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
        .text(function(d) { return d.name; });
}
