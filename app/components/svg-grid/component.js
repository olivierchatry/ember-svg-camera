import Ember from "ember"
import ResizeEvent from "../../mixins/resize-event";

export default Ember.Component.extend(ResizeEvent, {
	tagName: "g",
	classNames: ["svg-grid"],
	tickCount: 10,
	generateSvgLines() {
		const array = []
		let ticks = (this.get("tickCount") + 2) * 4
		// one line for each axis evert tick
		for (let i = 0; i < ticks; ++i) {
			const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			line.setAttribute("class", "tick")
			const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text.setAttribute("text-anchor", (i % 2) ? "start" : "start")
			text.setAttribute("class", "tick")

			array.push(line)
			array.push(text)
			this.element.appendChild(line)
			this.element.appendChild(text)
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
			this.element.appendChild(line)
		}
		return array
	},
	onDidInsertElement: Ember.on("didInsertElement", function() {
		this.set("ticks", this.generateSvgLines())
		this.set("subTicks", this.generateSubs())
		this.updateColor()
		this.updateFun = () => this.updateDisplay() 
		this.updateList.push(this.updateFun)
	}),
	onWillDestroyElement: Ember.on("willDestroyElement", function() {
		this.updateList.removeObject(this.updateFn)
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
		this.updateDisplay()
	},
	onResize:Ember.on("resize", function() {
		this.handleResize()
	}),
	updateDisplay() {
		const viewBox = this.get("camera.viewWithRatio")
		if (viewBox && this.element) {
			const globalScale = this.get("uiState.globalScale") || 1
			const textUnitScale = 1 / globalScale
			const unitScale = 1

			let x1 				= viewBox.x1 * unitScale
			let y1 				= -viewBox.y2 * unitScale
			const width 	= viewBox.width * unitScale

			const viewWidth = viewBox.viewWidth
			const viewHeight = viewBox.viewHeight

			const ratio = viewWidth / width
			this.set("camera.screenToWorld", ratio)
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
				subLineX.setAttribute("y2", viewHeight)

				subLineY.setAttribute("y1", y	- step * ratio * 0.5);
				subLineY.setAttribute("y2", y	- step * ratio * 0.5);
				subLineY.setAttribute("x2", viewWidth)


				lineX.setAttribute("y2", viewHeight);
				textX.setAttribute("x", x);
				textX.setAttribute("y", viewHeight - 10);
				// -(- is a hack to avoid 0.0 values ( yeah that sucks )
				let disp = xdisp * textUnitScale
				textX.textContent = String(-(-(disp).toFixed(1)));

				lineY.setAttribute("x2", viewWidth);
				lineY.setAttribute("y1", y);
				lineY.setAttribute("y2", y);
				textY.setAttribute("y", y);
				disp = (ydisp * textUnitScale)
				textY.textContent = -String(-(-(disp).toFixed(1)))
			}
		}
	}
})
