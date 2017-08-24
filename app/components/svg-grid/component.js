import Ember from "ember"
import ResizeEvent from "mixins/resize-event";


export default Ember.Component.extend({
	tagName: "svg",
	classNames: ["svg-stage-axis-scale"],
	tickCount: 10,
	generateSvgLines() {
		const array = []
		let ticks = (this.get("tickCount") + 2) * 4
		// one line for each axis evert tick
		this._parentElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this._parentElement.setAttribute("width", "100%")
		this._parentElement.setAttribute("height", "100%")
		for (let i = 0; i < ticks; ++i) {
			const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			line.setAttribute("class", "tick")
			const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text.setAttribute("text-anchor", (i % 2) ? "start" : "start")
			text.setAttribute("class", "tick")

			array.push(line)
			array.push(text)
			this._parentElement.appendChild(line)
			this._parentElement.appendChild(text)
		}
		return array
	},
	generateSubs() {
		const array = []
		let ticks = (this.get("tickCount") + 2) * 4
		for (let i = 0; i < ticks; ++i) {
			const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			line.setAttribute("class", "tick-thin")
			array.push(line)
			this._parentElement.appendChild(line)
		}
		return array
	},
	initialize: Ember.on("init", function() {
		this.set("ticks", this.generateSvgLines())
		this.set("subTicks", this.generateSubs())
		this.updateColor()
	}),
	ratio:1,
	scaleExtent(x1, x2, y1) {
		const m = this.get("tickCount")
		const span = x2 - x1
		let step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10))
		const err = m / span * step;
		if (err <= .15) step *= 10;
		else if (err <= .35) step *= 4;
		else if (err <= .85) step *= 2;
		return [
			Math.ceil(x1 / step) * step,
			Math.ceil(y1 / step) * step,
			step
		]
	},
	updateColor() {
		const color = this.get("model.gridColor") || "#FFFFFF"

		let fn = el => {
			if (el.tagName === "text") {
				el.setAttribute("fill", color)
			} else {
				el.setAttribute("stroke", color)
			}
		}
		let elements = this.get("ticks")
		if (elements) {
			elements.forEach(fn)
		}
		elements = this.get("subTicks", this.generateSubs())
		if (elements) {
			elements.forEach(fn)
		}
	},
	center : function() {
		let center = this.get("model.converter.center")
		if (Ember.isNone(center)) {
			return {x:0, y:0}
		}
		return center
	}.property("model.converter.center.{x,y}"),
	observeGridColor: function() {
		this.updateColor()
	}.observes("model.gridColor"),
	observeGridVisible: function() {
		// let isVisible = (this.element.children) && (this.element.children.length > 0)
		if (this.get("model.gridVisible")) {
			this.element.appendChild(this._parentElement)
		} else {
			this.element.removeChild(this._parentElement)
		}
	}.observes("model.gridVisible"),
	handleResize() {
		this.cacheElementBoundingBox()
		this.updateDisplay()
	},
	onResize:Ember.on("resize", function() {
		this.handleResize()
	}),
	updateDisplay() {
		let viewBox = this.get("viewBox")
		const bbox = this.getElementBoundingClientRect()
		if (viewBox && bbox && this.element) {
			let center = this.get("center")
			const textUnitScale = 1 / (this.get("uiState.globalScale"))
			const unitScale = 1
			let x1 = viewBox.get("x1") * unitScale
			let y1 = viewBox.get("y1") * unitScale
			const width = viewBox.get("width") * unitScale
			const height = viewBox.get("height") * unitScale

			const bboxWidth = this.element.getAttributeNS(null, "width") || bbox.width
			const bboxHeight = this.element.getAttributeNS(null, "height") || bbox.height

			const different = (this.x1 !== x1 || this.y1 !== y1 || this.width !== width || this.height !== height || this.bboxWidth !== bboxWidth || this.bboxHeight !== bboxHeight)
			if (!isNaN(x1) && !isNaN(y1) && !isNaN(width) && different) {
				this.x1 = x1
				this.y1 = y1
				this.width = width
				this.height = height
				this.bboxWidth = bboxWidth
				this.bboxHeight = bboxHeight



				const ratio = bboxWidth / width
				viewBox.set("screenToWorld", ratio)
				const scales = this.scaleExtent(x1, x1 + width, y1)
				this._scales = scales
				const start	= scales[0]
				const starty = scales[1]
				const step	 = scales[2]

				const ticks = this.get("ticks")
				const subs = this.get("subTicks")

				const tickCount = ticks.length
				for (let i = 0; i < tickCount; i = i + 4) {
					const index = i / 4
					const lineX = ticks[i]
					const textX = ticks[i + 1]
					const lineY = ticks[i + 2]
					const textY = ticks[i + 3]

					const subLineX = subs[(index * 2)]
					const subLineY = subs[(index * 2) + 1]
					const off = step * index

					let xdisp = start	+ off
					let ydisp = starty + off
					const x = (xdisp - x1) * ratio
					const y = (ydisp - y1) * ratio

					//xdisp *= unitScale
					//ydisp *= unitScale
					lineX.setAttribute("x1", x);
					lineX.setAttribute("x2", x);

					subLineX.setAttribute("x1", x	- step * ratio * 0.5);
					subLineX.setAttribute("x2", x	- step * ratio * 0.5);
					subLineX.setAttribute("y2", bboxHeight)

					subLineY.setAttribute("y1", y	- step * ratio * 0.5);
					subLineY.setAttribute("y2", y	- step * ratio * 0.5);
					subLineY.setAttribute("x2", bboxWidth)


					lineX.setAttribute("y2", bboxHeight);
					textX.setAttribute("x", x);
					textX.setAttribute("y", bboxHeight - 10);
					// -(- is a hack to avoid 0.0 values ( yeah that sucks )
					let disp = xdisp * textUnitScale + center.x
					textX.textContent = String(-(-(disp).toFixed(1)));

					lineY.setAttribute("x2", bboxWidth);
					lineY.setAttribute("y1", y);
					lineY.setAttribute("y2", y);
					textY.setAttribute("y", y);
					disp = center.y - (ydisp * textUnitScale)
					textY.textContent = String(-(-(disp).toFixed(1)))
				}
			}
		}
	},
	updateElementViewBox: function() {
		this.updateDisplay()
	}.observes("viewBox.{x1,y1,x2,y2}", "scale", "uiState.{globalScale,resizeSwitch}", "center"),
	insertElement : Ember.on("didInsertElement", function() {
			this.cacheElementBoundingBox()
			if (this.get("model.gridVisible")) {
				this.element.appendChild(this._parentElement)
			}
			Ember.run.scheduleOnce("afterRender", this, this.updateDisplay);
		}
	)
})
