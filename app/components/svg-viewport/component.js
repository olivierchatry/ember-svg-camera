import Ember from 'ember';

export default Ember.Component.extend({
	tagName:"g",
	attributeBindings:["transform"],
	transform:Ember.computed("camera.{viewWidth,viewHeight}", function() {
		const w = this.get("camera.viewWidth") * 0.5
		const h = this.get("camera.viewHeight") * 0.5
		return `matrix(${w} 0 0 ${h} ${w} ${h})`
	})
});
