import Ember from "ember"

export default Ember.Component.extend({
	tagName: "g",
	attributeBindings:["transform"],
	transform: Ember.computed("x", "y", "width", "height", function() {
		return `translate(${this.x - this.width * 0.5} ${this.y + this.height * 0.5})`
	})
})
