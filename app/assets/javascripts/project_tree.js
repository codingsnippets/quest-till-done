var tree;
var root;
var svg;
var duration = 750;
var diagonal;
var length;

function buildTree2(treeData) {
    var i = 0, duration = 750;
    // Create a svg canvas
    var height = 800;
    var width = 800;
    svg = d3.select("#tree-container").append("svg:svg")
       // .attr("width", width)
        //.attr("height", height)
        .append("g")
        .attr("transform", "translate(100, 0)"); // shift everything to the right

    // Create a tree "canvas"
    tree = d3.layout.tree()
        .size([height,width])

    diagonal = d3.svg.diagonal()
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
        .attr("r", 5.5);

    // place the name atribute left or right depending if children
    node.append("svg:text")
        .attr("dx", function(d) { return d.children ? -8 : 8; })
        .attr("dy", 3)
        .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
        .attr("cursor", "pointer")
        .text(function(d) { return d.attr.name; })
        //.on("click", nodeClick)
        .each(function(d)
        {
            $(this).popover({
                'trigger': 'click',
                'html': true,
                'title': '<a href='+ d.attr.url +'>'+d.attr.name + '</a>',
                'content': renderQuestDetail(d),
                'container': '#tree-container'
            });
        });

    node.append("svg:foreignObject")
        .attr("y",8)
        .attr("x", function(d) { return d.children ? -50 : 10; })
        .attr("width", 300)
        .attr("height", 300)
        .attr("class", "text")
        .append("xhtml:body")
        .html(function(d) {
            if(d.attr.status != "undefined" && d.attr.status != null) {
                var css = d.attr.status.toString().trim().replace(/ /g,'');
                return "<span class='label label-"+ css+"'>"+ d.attr.status +"</span>";
            }
        });
}

function buildTree(treeData)
{
    var margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = 960 - margin.right - margin.left,
        height = 960 - margin.top - margin.bottom;

    length = width / 3;

    tree = d3.layout.tree()
        .size([height, width]);

    diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });
    svg = d3.select("#tree-container").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    root = treeData;
    root.x0 = height / 2;
    root.y0 = 0;

    update(root);

    //d3.select(self.frameElement).style("height", "500px");
}

function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
   // nodes.forEach(function(d) { d.y = d.depth * length; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });
        //.on("click", click);

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; })
        .on("click", click);

    nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
        .attr("cursor", "pointer")
        .text(function(d) { return d.attr.name; })
        .each(function(d)
        {
            $(this).popover({
                'trigger': 'click',
                'html': true,
                'title': '<a href='+ d.attr.url +'>'+d.attr.name + '</a>',
                'content': renderQuestDetail(d),
                'container': '#tree-container'
            });
        });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 10)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
            var o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

function click(d) {
    $('#tree-container .popover').remove();
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
}

function nodeClick(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
}

function renderQuestDetail(d) {
    var css = d.attr.status.toString().trim().replace(/ /g,'');
    var html = "Description: " + d.attr.status + "</br>" +
               "Status: <span class='label label-"+ css+"'>"+ d.attr.status +"</span>"
    return html;
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
