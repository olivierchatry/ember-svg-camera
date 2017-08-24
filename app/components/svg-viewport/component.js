import Ember from 'ember';

export default Ember.Component.extend({
	tagName:"g",
	attributeBindings:["transform"],
	transform:Ember.computed("viewWidth", "viewHeight", function() {
			const w = this.get("viewWidth") * 0.5
			const h = this.get("viewHeight") * 0.5
			return `matrix(${w} 0 0 ${h} ${w} ${h})`
	})
});
