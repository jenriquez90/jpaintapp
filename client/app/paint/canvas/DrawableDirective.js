angular.module('paintApplication')
    .directive('drawableCanvas', ['CanvasManager', 'ConvoManager', function (CanvasManager, ConvoManager) {

        var DEFAULT = {
            color: "black",
            lineWidth: 2
        }

        function mouseDownHandler(originalContext, options) {

            if (options) {
                originalContext.strokeStyle = options.color || DEFAULT.color
                originalContext.lineWidth = options.lineWidth || DEFAULT.lineWidth
            } else {
                originalContext.strokeStyle = DEFAULT.color
                originalContext.lineWidth = DEFAULT.lineWidth
            }
            CanvasManager.startDrawing(originalContext)

        }

        function mouseMoveHandler(originalContext) {

            var oldX = null, oldY = null

            return function (event) {

                event.preventDefault();

                if (event.buttons === 1) {

                    if (!((oldX === event.offsetX) && (oldY === event.offsetY))) {
                        CanvasManager.draw(originalContext, oldX, oldY, event.offsetX, event.offsetY)
                        oldX = event.offsetX
                        oldY = event.offsetY
                    }
                } else {
                    oldX = oldY = undefined
                }
            }

        }

        function mouseUpHandler(scope, originalContext, myself) {
            //scope.conversation.image[myself] = LZString.compressToBase64(originalContext.canvas.toDataURL())

            //scope.canvasCollection[myself] = LZString.compressToBase64(originalContext.canvas.toDataURL())

            scope.conversation.image = scope.conversation.image || {}
            scope.conversation.image[myself] = LZString.compressToBase64(originalContext.canvas.toDataURL())

            setTimeout(function () {
                ConvoManager.sendImage(scope.conversation.roomId, scope.conversation.image[myself])
            }, 10)


        }

        return {
            scope: {
                //roomId: "=",
                conversation: "=drawableCanvas",
                myself: "&",
                options: "="
            },
            link: function (scope, elem, attr) {

                scope.conversation.canvasCollection = scope.conversation.canvasCollection || {}
                var jCanvas = angular.element(elem.find('canvas')[0])
                var originalContext = jCanvas[0].getContext ? jCanvas[0].getContext('2d') : null
                var myself = scope.myself()

                //originalContext.fillStyle = "black"
                originalContext.lineCap = "round"
                originalContext.lineJoin = "round"

                scope.conversation.canvasCollection[myself] = scope.conversation.canvasCollection[myself] || {}
                scope.conversation.canvasCollection[myself].canvas = scope.conversation.canvasCollection[myself].canvas || jCanvas.clone()

                if (scope.conversation && scope.conversation.canvasCollection[myself] && scope.conversation.canvasCollection[myself].canvas) {
                    var myContext = scope.conversation.canvasCollection[myself].canvas[0].getContext('2d')
                    if (myContext) {
                        elem.on("mousedown", function () {
                            mouseDownHandler(myContext, scope.conversation.canvaOptions)
                        })
                        //elem.on("touchstart", mouseDownHandler)
                        elem.on("mousemove",  mouseMoveHandler(myContext))
                        //elem.on("touchmove", mouseMoveHandler())
                        elem.on("mouseup", function () {
                            mouseUpHandler(scope, myContext, myself)
                        })
                        //elem.on("touchend", mouseUpHandler)
                    }
                }

                function orderLayers(members) {
                    if (members && members.length) {
                        elem.empty()
                        elem.append(jCanvas)
                        for (var i = 0; i < members.length; i++) {
                            if (scope.conversation.canvasCollection[members[i]] && scope.conversation.canvasCollection[members[i]].canvas) {
                                elem.prepend(scope.conversation.canvasCollection[members[i]].canvas)
                            }
                        }
                    }
                }

                scope.$watch('conversation.memberIds', function (members) {

                    if (angular.isArray(members)) {
                        orderLayers(members)
                    }
                })

                scope.$watch('conversation.members', function (members) {

                    console.log(members)

                    if (members && members.length > 0) {
                        for (var i = 0; i < members.length; i++) {

                            checkCanvasExists(members[i]._id)

                            if ((members[i].layerVisible == undefined) || (members[i].layerVisible == false)) {
                                if (scope.conversation.canvasCollection[members[i]._id] && scope.conversation.canvasCollection[members[i]._id].canvas)
                                    scope.conversation.canvasCollection[members[i]._id].canvas.addClass('hidden-canvas')
                            } else {
                                if (scope.conversation.canvasCollection[members[i]._id] && scope.conversation.canvasCollection[members[i]._id].canvas)
                                    scope.conversation.canvasCollection[members[i]._id].canvas.removeClass('hidden-canvas')
                            }
                        }

                        /*if (scope.conversation.canvasCollection[myself] && scope.conversation.canvasCollection[myself].canvas)
                         scope.conversation.canvasCollection[myself].canvas.removeClass('hidden-canvas')*/

                    }

                    orderLayers(scope.conversation.memberIds)

                }, true)

                scope.$watch('conversation.image', function (layers) {

                    for (layerId in layers) {

                        if (layerId !== myself)
                            checkCanvasExists(layerId)

                        scope.conversation.canvasCollection[layerId].imageData = LZString.decompressFromBase64(layers[layerId])

                        updateCanvases()

                    }

                }, true)

                function checkCanvasExists(layerId) {
                    if (!scope.conversation.canvasCollection[layerId]) {
                        scope.conversation.canvasCollection[layerId] = {}
                        scope.conversation.canvasCollection[layerId].canvas = jCanvas.clone()
                        orderLayers(scope.conversation.memberIds)
                    }
                }

                function updateCanvases() {

                    for (layerId in scope.conversation.canvasCollection) {
                        if (scope.conversation.canvasCollection[layerId] && scope.conversation.canvasCollection[layerId].canvas) {
                            (function (image) {
                                var context = scope.conversation.canvasCollection[layerId].canvas[0].getContext('2d')
                                context.clearRect(0, 0, context.canvas.width, context.canvas.height)
                                angular.element(image).on("load", function () {
                                    context.drawImage(image, 0, 0)
                                })
                                image.src = LZString.decompressFromBase64(scope.conversation.image[layerId])
                            })(new Image())
                        }
                    }

                }

                //checkCanvasExists(myself)

            }
        }

    }])
/*  .directive('drawableCanvas_b', ['CanvasManager', 'ConvoManager', function (CanvasManager, ConvoManager) {

 function mouseMoveHandler(context) {
 var oldX = oldY = null

 return function (event) {

 if (event.buttons === 1) {
 if (!((oldX === event.offsetX) && (oldY === event.offsetY))) {
 CanvasManager.draw(context, oldX, oldY, event.offsetX, event.offsetY)
 oldX = event.offsetX
 oldY = event.offsetY
 }
 } else {
 oldX = oldY = undefined
 }
 }
 }

 return {
 scope: {
 image: "=drawableCanvas",
 roomId: "="
 },
 link: function (scope, elem, attr) {

 if (elem[0].tagName && elem[0].tagName.toLowerCase() === "canvas") {

 //var context = elem[0].getContext ? elem[0].getContext('2d') : null,
 var jCanvas = elem,
 jClone = jCanvas.clone(),
 originalContext = jCanvas[0].getContext ? jCanvas[0].getContext('2d') : null,
 cloneContext = jClone[0].getContext ? jClone[0].getContext('2d') : null

 if (originalContext && cloneContext) {

 jCanvas.css({
 cursor: "default"
 })

 jCanvas.on("mousemove", mouseMoveHandler(originalContext))

 jCanvas.on("mouseup", function () {

 setTimeout(function () {
 ConvoManager.sendImage(scope.roomId, jCanvas)
 }, 10)

 })

 originalContext.fillStyle = "gray"
 originalContext.fillRect(0, 0, jCanvas.width, jCanvas.height)

 scope.$watch("image", function (newData) {

 originalContext.clearRect(0, 0, jCanvas.width, jCanvas.height)
 cloneContext.clearRect(0, 0, jClone.width, jClone.height)

 for (prop in newData) {
 var img = new Image
 angular.element(img).on("load", function () {
 cloneContext.drawImage(img, 0, 0)
 })
 img.src = newData[prop]
 }

 setTimeout(function () {
 var newImg = new Image
 angular.element(newImg).on("load", function () {
 originalContext.drawImage(newImg, 0, 0)
 })

 newImg.src = jClone[0].toDataURL()
 }, 10)

 }, true)

 }


 }
 }
 }

 }])*/