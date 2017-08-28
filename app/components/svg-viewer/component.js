import Ember from "ember";
import ResizeEvent from "../../mixins/resize-event";
import BoundingBox from "../../lib/bounding-box";

export default Ember.Component.extend(ResizeEvent, {
	tagName:"svg",
	attributeBindings:["viewBox","shapeRendering:shape-rendering", "transform"],
	shapeRendering:"auto",
	camera:new BoundingBox({
		x1:-1000, y1:-1000, x2:1000, y2:1000,
		viewWidth:1, viewHeight:1
	}),
	viewBox:Ember.computed("camera.{viewWidth,viewHeight}", function() {
		const camera 		= this.get("camera")
		return `${0} ${0} ${camera.viewWidth} ${camera.viewHeight}`
	}),
	onResize:Ember.on("resize", function(width, height) {
		this.camera.setProperties({
			viewWidth:width,
			viewHeight:height
		})
	})
});
