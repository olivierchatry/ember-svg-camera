import Ember from "ember"

export default Ember.Component.extend({
	tagName: "g",
	onDidInsertElement:Ember.on("didInsertElement", function() {
		const transform	= this.element.ownerSVGElement.createSVGTransform()
		const svgns			= "http://www.w3.org/2000/svg";
		const rect			= document.createElementNS(svgns, 'rect');
		const image			= this.$('image')[0]
		const parent		= image.parentNode
		let 	currentDisplay = image
		const bbox			= image.getBBox()		
		rect.setAttributeNS(null, 'height', this.height);
		rect.setAttributeNS(null, 'width', this.width);
    rect.setAttributeNS(null, 'fill', '#'+Math.round(0xffffff * Math.random()).toString(16));
		
		const	targetArea = 100
		
		const handleLodding = (w,h) => {
			const area = this.width * w * this.height * h 
			const display = area < targetArea ? rect : image
			if (display !== currentDisplay) {
				parent.replaceChild(display, currentDisplay)
				currentDisplay = display
			}
		}
		if (this.get('userAgent.browser.isIE') || this.get('userAgent.browser.isEdge')) {

			this.updateFn = (x, y, w, h) => {
				transform.setTranslate(this.x - this.width * 0.5 - x, this.y + this.height * 0.5 - y)
				this.element.transform.baseVal.initialize(transform)	
				handleLodding(w, h)
			}	
		} else {
			this.element.transform.baseVal.appendItem(transform)
			this.updateFn = (x, y, w, h) => {
				transform.setTranslate(this.x - this.width * 0.5 - x, this.y + this.height * 0.5 - y)
				handleLodding(w, h)
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
