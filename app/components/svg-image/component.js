import Ember from "ember"

export default Ember.Component.extend({
	tagName: "g",
	onDidInsertElement:Ember.on("didInsertElement", function() {
		const transform	= this.element.ownerSVGElement.createSVGTransform()
		const svgns			= "http://www.w3.org/2000/svg";
		const lod0			= document.createElementNS(svgns, 'image');
		const lod1			= document.createElementNS(svgns, 'image');
		const lod2			= document.createElementNS(svgns, 'rect');
			
		const parent		= this.$('g')[0]

		lod0.setAttributeNS(null, 'height', this.height);
		lod0.setAttributeNS(null, 'width', this.width);
    lod0.setAttributeNS('http://www.w3.org/1999/xlink','href', `${this.baseUrl}-00.svg`);

		lod1.setAttributeNS(null, 'height', this.height);
		lod1.setAttributeNS(null, 'width', this.width);
    lod1.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `${this.baseUrl}-01.svg`);
		
		lod2.setAttributeNS(null, 'height', this.height);
		lod2.setAttributeNS(null, 'width', this.width);
    lod2.setAttributeNS(null, 'fill', '#E4BD00');

		parent.appendChild(lod0)
		let 	currentDisplay = lod0
		
		const handleLodding = (w,h) => {
			const area = this.width * w * this.height * h
			const display = (area > 450) ? lod0 : (area > 100) ? lod1 : lod2
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
