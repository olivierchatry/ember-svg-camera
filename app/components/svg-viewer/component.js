import Ember from "ember";
import ResizeEvent from "../../mixins/resize-event";

export default Ember.Component.extend(ResizeEvent, {
	tagName:"svg",
	shapeRendering:"geometricPrecision",
	attributeBindings:["viewBox","preserveAspectRatio","shapeRendering:shape-rendering"],
	width:1,
	height:1,
	viewBox:Ember.computed("width", "height", function() {
		const svgWidth = this.get("width") || 1
		const svgHeight = this.get("height") || 1
		return `${0} ${0} ${svgWidth} ${svgHeight}`
	})
});
