/**
 * Dashboard 
 */
class Dashboard {
    /**
     * Construct function
     * Initialize Dashboard
     */
    constructor() {
        // Svg of left chart
        this.svgLeft = d3.select("#dashboard-svg-left");
        this.wLeft = this.svgLeft._groups[0][0].clientWidth;
        this.hLeft = this.svgLeft._groups[0][0].clientHeight;
        // Svg of right chart
        this.svgRight = d3.select("#dashboard-svg-right");
        this.wRight = this.svgRight._groups[0][0].clientWidth;
        this.hRight = this.svgRight._groups[0][0].clientHeight;
        // Initialize drop-down menu of state
        this.initDashboardSelect();
        // Initialize chart
        this.initChart();
    }

    /**
     * Initialize drop-down menu of state
     */
    initDashboardSelect() {
        let states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
        d3.select("#dashboard-select")
            .selectAll("option")
            .data(states)
            .join("option")
            .attr("value", d => d)
            .html(d => d);
        d3.select("#dashboard-select")
            .on("change", () => {
                this.onStateChange()
            });

    }

    /**
     * Format the candidate data of country
     * @param {Data returned by the server} data 
     * @returns Candidate's data（Trump,Biden,Others）of country
     */
    formatCandidateData(data) {
        let result = [];
        for (let countyName in data.county_data) {
            let name = data.county_data[countyName].name;
            let votes = 0;
            for (let d in data.county_data[countyName].candidate_data) {
                votes += data.county_data[countyName].candidate_data[d].total_votes;
            }
            let trumpVotes = data.county_data[countyName].candidate_data["Donald Trump"].total_votes;
            let bidenVotes = data.county_data[countyName].candidate_data["Joe Biden"].total_votes;
            let otherVotes = votes - trumpVotes - bidenVotes;

            let trumpPercent = parseInt((trumpVotes * 100.0) / votes);
            let bidenPercent = parseInt((bidenVotes * 100.0) / votes);
            let otherPercent = 100 - trumpPercent - bidenPercent;
            result.push({
                countyName,
                name,
                votes,
                trumpVotes,
                trumpPercent,
                bidenVotes,
                bidenPercent,
                otherVotes,
                otherPercent
            })
        }
        result.sort((a, b) => {
            return b.trumpPercent - a.trumpPercent;
        })
        return result;
    }

    /**
     * Format  the data of state
     * @param {Data returned by the server} data 
     * @return Voting data for each state
     */
    formatStateData(data) {
        let result = [];
        for (let state in data) {
            let totalVotes = 0;
            for (let candidate in data[state]) {
                totalVotes += data[state][candidate];
            }
            let trumpVotes = data[state]["Donald Trump"];
            let bidenVotes = data[state]["Joe Biden"];
            let otherVotes = totalVotes - trumpVotes - bidenVotes;
            let trumpPercent = parseInt((trumpVotes * 100.0) / (totalVotes));
            let bidenPercent = parseInt((bidenVotes * 100.0) / (totalVotes));
            result.push({
                state,
                totalVotes,
                trumpVotes,
                trumpPercent,
                bidenVotes,
                bidenPercent
            })
        }
        result.sort((a, b) => {
            return b.trumpPercent - a.trumpPercent;
        });
        return result;
    }

    /**
     * Show Tooltip
     * @param {x} x 
     * @param {y} y 
     * @param {Display content} html 
     */
    showTooltip(x, y, html) {
        d3.select("#tooltip").html(html)
            .style("left", x + "px")
            .style("top", y + "px")
            .style("opacity", 0.95)
            .style("display", "")
            ;
    }

    /**
     * Close Tooltip
     */
    closeTooltip() {
        d3.select("#tooltip").style("display", "none");
    }

    /**
     * Initialize left chart
     */
    initLeftChart() {
        d3.json("http://127.0.0.1:5000/get_state_data").then((data) => { // Load data
            //Format the data of state
            data = this.formatStateData(data);
            // Set the height of the svg according to the number of data items.
            let rectH = 30;
            d3.select("#dashboard-svg-left").attr("height", `${rectH * data.length + 50}px`);
            this.svgLeft = d3.select("#dashboard-svg-left");
            this.wLeft = this.svgLeft._groups[0][0].clientWidth;
            this.hLeft = this.svgLeft._groups[0][0].clientHeight;
            // Clear SVG canvas.
            this.svgLeft.selectAll("g").remove();
            // SVG Params
            let g = this.svgLeft.append("g");
            let w = this.wLeft;
            let h = this.hLeft;
            let margin = {
                left: 40,
                right: 20,
                top: 15,
                bottom: 20
            };
            let halfW = (w - margin.left - margin.right) / 2;
            g = g.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            // Create a scale for x coordinates
            let x = d3.scaleLinear()
                .domain([0, d3.max([d3.max(data, d => d.trumpPercent), d3.max(data, d => d.bidenPercent)])])
                .range([15, halfW]);
            // Create a scale for y coordinates
            let y = d3.scaleBand()
                .domain(data.map((d, i) => d.state))
                .range([0, h - margin.top - margin.bottom])
                .padding(0.15);
            // Create TrumpRectangle
            g.selectAll(".Trump")
                .data(data)
                .join("rect")
                .attr("x", d => halfW - x(d.trumpPercent))
                .attr("y", (d, i) => y(d.state))
                .attr("height", y.bandwidth())
                .attr("width", d => x(d.trumpPercent))
                .attr("fill", "#ec1f27")
                .attr("rx", 2)
                .attr("ry", 2)
                ;
            // Craete TrumpText
            g.selectAll(".TrumpText")
                .data(data)
                .join("text")
                .attr("x", d => halfW)
                .attr("y", d => y(d.state) + y.bandwidth() - 8)
                .text(d => d.trumpPercent + "%")
                .style("direction", "rtl")
                .style("text-anchor", "left")
                .style("fill", "#fff")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("font-family", "Arial, Helvetica, sans-serif");
            ;
            // Create Label of Trump
            g.append("text")
                .attr("x", d => halfW)
                .attr("y", 0)
                .text("Trump")
                .style("direction", "rtl")
                .style("text-anchor", "left")
                .style("fill", "#000")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .style("font-family", "Arial, Helvetica, sans-serif");
            ;
            // Create BidenRectangle
            g.selectAll(".Biden")
                .data(data)
                .join("rect")
                .attr("x", d => halfW + x.range()[0])
                .attr("y", (d, i) => y(d.state))
                .attr("height", y.bandwidth())
                .attr("width", d => x(d.bidenPercent))
                .attr("fill", "#3ca4c4")
                .attr("rx", 2)
                .attr("ry", 2)
                ;
            // Craete BidenText
            g.selectAll(".BidenText")
                .data(data)
                .join("text")
                .attr("x", d => halfW + x.range()[0])
                .attr("y", d => y(d.state) + y.bandwidth() - 8)
                .text(d => d.bidenPercent + "%")
                .style("direction", "ltr")
                .style("text-anchor", "left")
                .style("fill", "#fff")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("font-family", "Arial, Helvetica, sans-serif")
                ;
            // Create label of Biden
            g.append("text")
                .attr("x", d => halfW + x.range()[0])
                .attr("y", 0)
                .text("Biden")
                .style("direction", "ltr")
                .style("text-anchor", "left")
                .style("fill", "#000")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .style("font-family", "Arial, Helvetica, sans-serif")
                ;

            // Create text of State
            this.svgLeft.append("g")
                .attr("transform", "translate(" + 0 + "," + margin.top + ")")
                .selectAll(".StateText")
                .data(data)
                .join("text")
                .attr("x", 0)
                .attr("y", d => y(d.state) + y.bandwidth() - 8)
                .text(d => d.state)
                .style("direction", "ltr")
                .style("fill", "#000")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .style("font-family", "Arial, Helvetica, sans-serif");
            
             // Create "mouseover" event listener to display votes
            g.selectAll("rect")
                .on("mousemove", (e, d) => {
                    let offsetX = e.pageX;
                    let offsetY = e.pageY;
                    let html = `
                    <div style="text-align:center">
                        <label>${d.state}<label>
                    </div>
                    <svg width=10 height=10><circle r=5 cx=5 cy=5 fill="#ec1f27"><circle></svg>
                    <label>Trump:${d.trumpVotes}(${d.trumpPercent}%)</label>
                    <br />
                    <svg width=10 height=10><circle r=5 cx=5 cy=5 fill="#3ca4c4"><circle></svg>
                    <label>Biden:${d.bidenVotes}(${d.bidenPercent}%)</label>
                    `
                    this.showTooltip(offsetX + 10, offsetY + 10, html);
                })
                .on("mouseout", () => {
                    this.closeTooltip();
                })
                .on("click", (e, d)=>{
                    this.onStateBarClick(d.state);
                })
                ;

        });
    }

    /**
     * Initialize right chart
     * @param {Data returned by the server} data 
     */
    initRightChart(data) {
        // Format candidatedata
        data = this.formatCandidateData(data);
        // Set the height of the svg according to the number of data items.
        let rectH = 30;
        d3.select("#dashboard-svg-right").attr("height", `${rectH * data.length + 50}px`);
        this.svgRight = d3.select("#dashboard-svg-right");
        this.wRight = this.svgRight._groups[0][0].clientWidth;
        this.hRight = this.svgRight._groups[0][0].clientHeight;
        // Clear SVG
        this.svgRight.selectAll("g").remove();
        // SVG Params
        let g = this.svgRight.append("g");
        let w = this.wRight;
        let h = this.hRight;
        let margin = {
            left: 90,
            right: 30,
            top: 15,
            bottom: 20,
            padding: 3
        };
        g = g.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        // Create a scale for x coordinates
        let x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, w - margin.left - margin.right - margin.padding * 3]);
        // Create a scale for y coordinates
        let y = d3.scaleBand()
            .domain(data.map((d, i) => d.countyName))
            .range([0, h - margin.top - margin.bottom])
            .padding(0.15);
        // Create TrumpRectangle
        g.selectAll(".Trump")
            .data(data)
            .join("rect")
            .attr("x", d => x(0))
            .attr("y", (d, i) => y(d.countyName))
            .attr("height", y.bandwidth())
            .attr("width", d => x(d.trumpPercent))
            .attr("fill", "#ec1f27")
            .attr("rx", 2)
            .attr("ry", 2)
            ;
        // Create BidenRectangle
        g.selectAll(".Biden")
            .data(data)
            .join("rect")
            .attr("x", d => x(0) + x(d.trumpPercent) + margin.padding)
            .attr("y", (d, i) => y(d.countyName))
            .attr("height", y.bandwidth())
            .attr("width", d => x(d.bidenPercent))
            .attr("fill", "#3ca4c4")
            .attr("rx", 2)
            .attr("ry", 2)
            ;
        // Create OtherRectangle
        g.selectAll(".Other")
            .data(data)
            .join("rect")
            .attr("x", d => x(0) + x(d.trumpPercent) + margin.padding * 2 + x(d.bidenPercent))
            .attr("y", (d, i) => y(d.countyName))
            .attr("height", y.bandwidth())
            .attr("width", d => x(d.otherPercent))
            .attr("fill", "#CCCC00")
            .attr("rx", 2)
            .attr("ry", 2)
            ;
        // Create TrumpText
        g.selectAll(".TrumpText")
            .data(data)
            .join("text")
            .attr("x", d => x(0) + 3)
            .attr("y", d => y(d.countyName) + y.bandwidth() - 8)
            .text(d => {
                if (d.trumpPercent < 3) {
                    return ""
                }
                return d.trumpPercent + "%";
            })
            .style("direction", "ltr")
            .style("text-anchor", "left")
            .style("fill", "#fff")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("font-family", "Arial, Helvetica, sans-serif");
        ;
        // Create BidenText
        g.selectAll(".BidenText")
            .data(data)
            .join("text")
            .attr("x", d => x(0) + x(d.trumpPercent) + margin.padding + 3)
            .attr("y", d => y(d.countyName) + y.bandwidth() - 8)
            .text(d => {
                if (d.bidenPercent < 3) {
                    return ""
                }
                return d.bidenPercent + "%";
            })
            .style("direction", "ltr")
            .style("text-anchor", "left")
            .style("fill", "#fff")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("font-family", "Arial, Helvetica, sans-serif");
        ;
        //  Create OtherText
        g.selectAll(".OtherText")
            .data(data)
            .join("text")
            .attr("x", d => x(0) + x(d.trumpPercent) + margin.padding * 2 + x(d.bidenPercent) + 3)
            .attr("y", d => y(d.countyName) + y.bandwidth() - 8)
            .text(d => {
                if (d.otherPercent < 5) {
                    return ""
                }
                return d.otherPercent + "%";
            })
            .style("direction", "ltr")
            .style("text-anchor", "left")
            .style("fill", "#fff")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("font-family", "Arial, Helvetica, sans-serif");
        ;
        // Create legend
        let names = ["Trump", "Biden", "Others"];
        let legend = g.selectAll(".legend")
            .data(names)
            .join("g");
        legend.append("rect")
            .attr("x", (d, i) => 10 + i * 90)
            .attr("y", -10)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", (d, i) => {
                return ['#ec1f27', "#3ca4c4", "yellow"][i];
            })
            .attr("rx", 2)
            .attr("ry", 2)
            ;
        legend.append("text")
            .attr("x", (d, i) => 10 + i * 90 + 20)
            .attr("y", -2)
            .text(d => d)
            .style("direction", "ltr")
            .style("text-anchor", "left")
            .style("fill", "#000")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("font-family", "Arial, Helvetica, sans-serif")
            ;
        // Create county
        this.svgRight.append("g")
            .attr("transform", "translate(" + 0 + "," + margin.top + ")")
            .selectAll(".StateText")
            .data(data)
            .join("text")
            .attr("x", 0)
            .attr("y", d => y(d.countyName) + y.bandwidth() - 8)
            .text(d => d.name)
            .style("direction", "ltr")
            .style("fill", "#000")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("font-family", "Arial, Helvetica, sans-serif");
        // Create "mouseover" event listener 
        g.selectAll("rect")
            .on("mousemove", (e, d) => {
                let offsetX = e.pageX;
                let offsetY = e.pageY;
                let html = `
                <div style="text-align:center">
                    <label>${d.countyName}<label>
                </div>
                <svg width=10 height=10><circle r=5 cx=5 cy=5 fill="#ec1f27"><circle></svg>
                <label>Trump:${d.trumpVotes}(${d.trumpPercent}%)</label>
                <br />
                <svg width=10 height=10><circle r=5 cx=5 cy=5 fill="#3ca4c4"><circle></svg>
                <label>Biden:${d.bidenVotes}(${d.bidenPercent}%)</label>
                <br />
                <svg width=10 height=10><circle r=5 cx=5 cy=5 fill="#CCCC00"><circle></svg>
                <label>Others:${d.otherVotes}(${d.otherPercent}%)</label>
                `
                this.showTooltip(offsetX  - 100, offsetY + 10, html);
            })
            .on("mouseout", () => {
                this.closeTooltip();
            });

    }

    /**
     * Update left chart
     * @param {*} data 
     */
    updateLeftChart(data) {
        this.initLeftChart(data);
    }

    /**
     * Update right chart
     * @param {*} data 
     */
    updateRtghtChart(data) {
        this.initRightChart();
    }

    /**
     * Initialize chart
     */
    initChart() {
        this.initLeftChart();
        this.onStateChange();
    }

    /**
     * The callback function of the State drop-down menu.
     */
    onStateChange() {
        // Get value of drop-down menu
        let state = document.getElementById("dashboard-select").value;
        // Query the data of State and update right chart
        d3.json(`http://127.0.0.1:5000/get_state_data/${state}`).then((data) => {
            this.initRightChart(data);
        })
    }

    /**
     * Click on callback function of state bar in left chart，and update State of right chart
     * @param {state} state 
     */
    onStateBarClick(state){
        // Update State to display content
        document.getElementById("dashboard-select").value = state;
        // Update right chart
        this.onStateChange();
        // Locate to the top of the page 
        if(window.location){
            window.location.href = "#dashboard-select";
        }

    }

}


const dashboard = new Dashboard();