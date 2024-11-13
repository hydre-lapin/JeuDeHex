function creeHexagone(rayon) {
    var points = [];
    for (var i = 0; i < 6; ++i) {
        var angle = i * Math.PI / 3;
        var x = Math.sin(angle) * rayon;
        var y = -Math.cos(angle) * rayon;
        points.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
    }
    return points;
}

function genereDamier(rayon, nbLignes, nbColonnes) {
    var distanceHorizontale = rayon * Math.sqrt(3);
    var distanceVerticale = rayon * 1.5;

    var svgWidth = ((nbColonnes - 1) * distanceHorizontale) + (nbLignes * distanceHorizontale / 2);
    var svgHeight = ((nbLignes - 1.5) * distanceVerticale) + (rayon * 2);
    svgWidth += Math.floor(distanceHorizontale / 2) + 10;
    svgHeight += distanceVerticale / 2;

    // Vider le contenu du tablier avant de dessiner
    d3.select("#tablier").html("");

    var svg = d3.select("#tablier").append("svg").attr("width", svgWidth).attr("height", svgHeight);
    var hexagone = creeHexagone(rayon);


    for (var ligne = 0; ligne < nbLignes; ligne++) {
        for (var colonne = 0; colonne < nbColonnes; colonne++) {
            var d = "M";
            var xOffset = colonne * distanceHorizontale + (ligne * distanceHorizontale / 2) + rayon;
            var yOffset = ligne * distanceVerticale + rayon;
            console.log(xOffset, yOffset);

            for (var h in hexagone) {
                var x = hexagone[h][0] + xOffset;
                var y = hexagone[h][1] + yOffset;
                d += x + "," + y + " ";
            }
            d += "Z";
            d3.select("svg")
                .append("path")
                .attr("d", d)
                .attr("stroke", "black")
                .attr("fill", "white")
                .attr("id", "h" + (ligne * nbColonnes + colonne))
                .on("click", function() {
                    if (!isTurn) {
                        console.log("Ce n'est pas votre tour !");
                        return;
                    }
                    
                    let numHexagone = parseInt(d3.select(this).attr('id').substring(1));
                    console.log("Hexagone cliqué : " + numHexagone);
                    d3.select(this).attr('fill', "white");

                    d3.select(this).on("click", null); //Désactive le clic après la première sélection

                    socket.emit('hexagoneSelectionne', {
                        joueur: playerNumber,
                        hexagone: numHexagone
                    });
                });                            
        }
    }
}