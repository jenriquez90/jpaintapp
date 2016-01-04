angular.module('paintApplication')
    .factory("CanvasManager", function () {

        var points = [], snapshot;

        return {
            startDrawing: function (context) {
                points.length = 0
                snapshot = new Image()
                snapshot.src = context.canvas.toDataURL()

            },
            draw: function (context, oldX, oldY, X, Y) {

                /*setTimeout(function(){
                    var backup = context.globalCompositeOperation
                    context.globalCompositeOperation = "destination-out"
                    context.strokeStyle = "rgba(0,0,0,1)"

                    console.log('go')

                    setTimeout(function(){

                        console.log('go 2')

                        context.globalCompositeOperation = backup
                    }, 5000)

                }, 5000)
*/

                if (oldX !== undefined && oldY !== undefined) {

                    points.push({x: X, y: Y})

                    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
                    context.drawImage(snapshot, 0, 0)

                    context.beginPath()

                    for (var i = 0; i < points.length; i++) {
                        context.lineTo(points[i].x, points[i].y)

                    }

                    context.stroke()

                }

            }
        }
    })


