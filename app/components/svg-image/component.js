import Ember from "ember"

export default Ember.Component.extend({
	tagName: "g",
	onDidInsertElement:Ember.on("didInsertElement", function() {
		const transform = this.element.ownerSVGElement.createSVGTransform()

		if (this.get('userAgent.browser.isIE') || this.get('userAgent.browser.isEdge')) {
			this.updateFn = (x, y, w, h) => {
				if (this.width / w > 1 && this.height / h > 1) {
					transform.setTranslate(this.x - this.width * 0.5 - x, this.y + this.height * 0.5 - y)
					this.element.transform.baseVal.initialize(transform)	
					this.element.style.display = "block"
				} else {
					this.element.style.display = "none"
				}
			}	
		} else {
			this.element.transform.baseVal.appendItem(transform)
			this.updateFn = (x, y, w, h) => {
				if (this.width / w > 1 && this.height / h > 1) {
					transform.setTranslate(this.x - this.width * 0.5 - x, this.y + this.height * 0.5 - y)
					this.element.style.display = "block"
				} else {
					this.element.style.display = "none"
				}
			}
		}
		/* IE11 support
		*/
		this.updateList.push(this.updateFn)
	}),
	onWillDestroyElement: Ember.on("willDestroyElement", function() {
		this.updateList.removeObject(this.updateFn)
	})
})
