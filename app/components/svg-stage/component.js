import Ember from 'ember';

const randFloat = (min, max) => Math.random() * (max - min) + min;
const randInt		= (min, max) => Math.floor(randFloat(min, max));
export default Ember.Component.extend({
	tagName:"g",
	attributeBindings:["transform"],
	onDidInsertElement:Ember.on("didInsertElement", function() {
		let previous = performance.now()
		let angle = 0, angleZoom = 0

		const fct = () => {
			const timestamp = performance.now()
			const delta =  (timestamp - previous) / 1000.0
			previous = timestamp
			angle = angle + (Math.PI / 8) * delta
			angleZoom = angleZoom + (Math.PI / 4) * delta * 0.1
			const zoom = 11000 + Math.cos(angleZoom) * 10000
			const center = {
				x:10000000 + Math.cos(angle) * zoom * 0.25,
				y:10000000 + Math.sin(angle) * zoom * 0.25
			}

			this.camera.setProperties({
				x1:-zoom + center.x,
				y1:-zoom + center.y,
				x2: zoom + center.x,
				y2: zoom + center.y
			})
			this.updateMatrix()
			//setTimeout(fct.bind(this), 100)
			window.requestAnimationFrame(fct.bind(this))
		}
		//setTimeout(fct.bind(this), 100)
		window.requestAnimationFrame(fct.bind(this))
	}),
	images:Ember.computed(function() {
		const images = []
		for (let i = 0; i < 100; ++i) {
			const ratio = 30/50
			const w = randInt(10, 320) 
			const d = 10000
			const image = {
				x:randFloat(10000000 - d, 10000000 + d),
				y:randFloat(10000000 - d, 10000000 + d),
				w:w,
				h:w * ratio
			}
			images.push(image)
		}
		return images
	}),
	updateMatrix() {
		const {x, y}				 = this.get("camera.center")
		let 	{x1, x2, y1, y2} = this.get("camera.viewWithRatio");
		x1 -= x, y1 -= y, x2 -= x, y2 -= y
		const transform = `matrix(${2 / (x2 - x1)} 0 0 ${2 / (y2 - y1)} ${-(x2 + x1) / (x2 - x1)} ${-(y2 + y1) / (y2 - y1)})`
		this.element.setAttributeNS(null,"transform", transform)
		this.updateList.forEach(a => a(x, y, (x2 - x1) / this.camera.viewWidth, (y2 - y1)  / this.camera.viewHeight))
	}
	// transformObserver:Ember.observer("camera.viewWithRatio.{x1,y1,x2,y2}", function() {
	// 	this.updateMatrix()
	// })
});
