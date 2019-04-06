import { Meteor } from "meteor/meteor";
import d3 from "d3";

const draw = spans => {
	if (Meteor.isServer) {
		if (!spans || !spans.length) {
			return "";
		}

		const jsdom = require("jsdom");
		const { JSDOM } = jsdom;
		const { document } = (new JSDOM("").window);
		const svg = d3.select(document.body).append("svg"),
			margin = ({top: 20, right: 0, bottom: 30, left: 40}),
			height = 250,
			width = 500;
		
		if (typeof fetch !== "function") {
			global.fetch = require("node-fetch-polyfill");
		}

		const data = spans.map((value, i) => ({
			date: i,
			value
		}));

		const yAxis = g => g
			.attr("transform", `translate(${margin.left},0)`)
			.call(d3.axisLeft(y))
			.call(g => g.select(".domain").remove())
			.call(g => g.select(".tick:last-of-type text").clone()
				.attr("x", 3)
				.attr("text-anchor", "start")
				.attr("font-weight", "bold")
				.text(data.y));
		
		const xAxis = g => g
			.attr("transform", `translate(0,${height - margin.bottom})`)
			.call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

		const y = d3.scaleLinear()
			.domain([0, d3.max(data, d => d.value)]).nice()
			.range([height - margin.bottom, margin.top]);

		const x = d3.scaleLinear()
			.domain([0, d3.max(data, d => d.date)]).nice()
			.range([margin.left, width - margin.right]);

		const line = d3.line()
			.defined(d => !isNaN(d.value))
			.x(d => x(d.date))
			.y(d => y(d.value));

		svg.append("g")
			.call(xAxis);
  
		svg.append("g")
			.call(yAxis);
		
		svg.append("path")
			.datum(data)
			.attr("fill", "none")
			.attr("stroke", "#80bf2e")
			.attr("stroke-width", 1.5)
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("d", line);
		
		const res = `<svg height='250' width='500'>${svg.node().innerHTML.replace(/"/g, "'")}</svg>`;
		return res;
	}

	return "function only works on server side";
};

export default draw;