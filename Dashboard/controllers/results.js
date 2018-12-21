$(document).ready(function () {

    function ajaxCallsFunc(type, url, contentType, data, callback) {
        $.ajax({
            type: type,
            url: url,
            contentType: contentType,
            data: data,
            success: callback
        });
    }



    window.onload = function () {
        console.log('loading')

        ajaxCallsFunc('POST', "http://127.0.0.1:5000/get_algos", 'application/json', null, function (branches) {
            var ab = new Object();
            for (var x in branches) {
                ab[branches[x]] = null;
            }

            addChips(ab);
        });


        ajaxCallsFunc('POST', "http://127.0.0.1:5000/get_results", 'application/json', null, function (branches) {

            console.log(branches);
            var data = branches['Results'];
            var fit_data = branches['Samples']
            var elapsed_time = branches['Elapsed']
            console.log(branches['Elapsed'])
            var data = jQuery.parseJSON(JSON.stringify(data));

            var target_vars = []

            for (var x in data) {
                target_vars.push(x);
            }
            var algo_names = []

            for (var x in data[target_vars[0]]) {
                algo_names.push(x);
            }

            var metric_names = []
            var temp = target_vars[0];

            var temp2 = algo_names[0];
            var metric_pf = data[temp][temp2];

            for (var x in JSON.parse(metric_pf)) {
                metric_names.push(x);
            }
            var temp8 = []
            for (var h = 0; h < target_vars.length; h++) {
                temp8.push(data[target_vars[h]]);
            }
            var tab_count = 1;
            for (var i = 0; i < target_vars.length; i++) {
                var target_var = target_vars[i];
                var data_dict = [];
                // var tes1 = data[target_var];
                var tes1 = temp8[i];
                for (var j = 0; j < metric_names.length; j++) {
                    var metric_name = metric_names[j];
                    var algo_perf = {};
                    var x = []
                    var y = []

                    for (var k = 0; k < algo_names.length; k++) {
                        var algo_name = algo_names[k];
                        var metric_vals = JSON.parse(tes1[algo_name]);//data[target_var][algo_name]
                        metric_perf = metric_vals[metric_name];
                        algo_perf[algo_name] = metric_perf;
                        x.push(algo_name);
                        y.push(metric_perf);
                    }
                    data_dict.push({ 'x': x, 'y': y, 'name': metric_name, 'type': 'bar' });

                }

                $plot_title = $('#plots-title');
                var tab = "<li class=\"tab col \"><a href=\"#plot" + tab_count.toString() + "\">" + target_var + "</a></li>";
                var tab2 = "<li class=\"tab col \"><a href=\"#plot" + tab_count.toString() + "_scatter\">" + target_var + " Scatter</a></li>";
                $plot_title.append(tab);
                $plot_title.append(tab2);

                $plot_content = $('#plots-content');
                var tab_content = "<div id=\"plot" + tab_count.toString() + "\" ></div>"
                var tab_content_scatter = "<div id=\"plot" + tab_count.toString() + "_scatter\" ></div>"
                $plot_content.append(tab_content);
                $plot_content.append(tab_content_scatter)

                var tab_content_div = document.getElementById("plot" + tab_count.toString());
                var tab_content_scatter_div = document.getElementById("plot" + tab_count.toString() + "_scatter");

                var actual = fit_data[target_var]['Actual']
                var pred = fit_data[target_var]['predicted']
                x = []
                y = []

                var scat_graph_data = [];
                for (var dp = 0; dp < actual.length; dp++) {
                    x.push(dp + 1);
                    y.push(actual[dp])
                }


                var act_graph = {
                    "x": x,
                    "y": y,
                    "mode": 'lines+markers',
                    // "connectgaps": true,
                    "name": target_var,
                    "line": { shape: 'linear', smoothing: 0 },
                    "type": "scatter"
                }

                scat_graph_data.push(act_graph);

                for (var y in pred) {
                    // console.log(x + " "+ target_var)
                    // console.log(pred[x])
                    var x = [];
                    for (var m = 1; m <= pred[y].length; m++) {
                        x.push(m);
                    }
                    scat_graph_data.push({

                        'x': x,
                        'y': pred[y],
                        'mode': 'lines+markers',
                        // 'connectgaps':true,
                        'name': y + " (" + target_var + ")",
                        "line": { shape: 'linear', smoothing: 0 },
                        "type": "scatter"

                    });
                }

                var layout = {
                    title: 'Algorithm Metric Comparison of: "' + target_var + '"',
                    barmode: 'group',
                    bargap: 0.25,
                    bargroupgap: 0.1,
                    // barnorm: 'percent'

                };

                var layout2 = {
                    title: 'Algorithms Coverage of Target Variable: "' + target_var + '"',
                    xaxis: {
                        title: 'Test Sample Size',
                        titlefont: {
                            family: 'Courier New, monospace',
                            size: 18,
                            color: '#7f7f7f'
                        }
                        // x = [1,5]
                    },
                    yaxis: {
                        title: target_var + ' level',
                        titlefont: {
                            family: 'Courier New, monospace',
                            size: 18,
                            color: '#7f7f7f'
                        }
                        // visible:false
                    },

                    legend: {
                        y: [1, 5],
                        // traceorder: 'reversed',

                        font: {
                            size: 16
                        },
                        yref: 'paper'
                    }
                }


                console.log(target_var)
                var barDiv = $('#bar-chart');
                Plotly.newPlot(tab_content_div, data_dict, layout);
                Plotly.newPlot(tab_content_scatter_div, scat_graph_data, layout2);
                tab_count = tab_count + 1;
                $('.tabs').tabs();

            }

            // ==============================================================DOCKER & OW TIME COMPARISON================================================================
            $plot_title_1 = $('#plots-title');
            var tab_time = "<li class=\"tab col \"><a href=\"#plot_time_comparison\">Response Time Comparison</a></li>";
            $plot_title_1.append(tab_time);

            $plot_content_1 = $('#plots-content');
            var tab_time_content = "<div id=\"plot_time_comparison\" ></div>"
            $plot_content_1.append(tab_time_content);
            var tab_content_div2 = document.getElementById("plot_time_comparison");

            var docker_data = branches['Elapsed']['docker']['run_time']
            var whisk_data = branches['Elapsed']['whisk']['run_time']

            var x = []
            var y = []
            var z = []
            for (var i = 0; i < docker_data.length; i++) {
                x.push(i);
                y.push(docker_data[i]);
                z.push(whisk_data[i]);
            }

            var time_com_graph = []
            time_com_graph.push({

                'x': x,
                'y': y,
                'mode': 'lines+markers',
                // 'connectgaps':true,
                'name': "Docker",
                "line": { shape: 'linear', smoothing: 0 },
                "type": "scatter"

            },
                {

                    'x': x,
                    'y': z,
                    'mode': 'lines+markers',
                    // 'connectgaps':true,
                    'name': "Open Whisk",
                    "line": { shape: 'linear', smoothing: 0 },
                    "type": "scatter"

                });


            var layout3 = {
                title: 'Response Time Comparison Docker & Serverless(Open Whisk)',
                xaxis: {
                    title: 'Number of Runs',
                    titlefont: {
                        family: 'Courier New, monospace',
                        size: 18,
                        color: '#7f7f7f'
                    }
                    // x = [1,5]
                },
                yaxis: {
                    title: 'Response Time',
                    titlefont: {
                        family: 'Courier New, monospace',
                        size: 18,
                        color: '#7f7f7f'
                    }
                    // visible:false
                },

                legend: {
                    y: [1, 5],
                    // traceorder: 'reversed',

                    font: {
                        size: 16
                    },
                    yref: 'paper'
                }
            }

            Plotly.newPlot(tab_content_div2, time_com_graph, layout3);

            // ==========================================================DOCKER & OW TIME COMPARISON END================================================================
            $plot_title = $('#plots-title');
            var tab_CI = "<li class=\"tab col \"><a href=\"#plot_CI_comparison\">Response Time Comparison with CI=0.95</a></li>";
            $plot_title.append(tab_CI);

            $plot_content = $('#plots-content');
            var tab_CI_content = "<div id=\"plot_CI_comparison\" ></div>"
            $plot_content.append(tab_CI_content);
            var tab_content_CI = document.getElementById("plot_CI_comparison");

            var docker_CI = branches['Elapsed']['docker']['run_time']
            var whisk_CI = branches['Elapsed']['whisk']['run_time']

            console.log(docker_CI)
            console.log(whisk_CI)
            y = []
            for (var i = 0; i < docker_CI.length; i++) {
                y.push(docker_CI[i]);
            }
            var trace1 = {
                y: y,
                type: 'box',
                name: 'Docker',
                jitter: 0.3,
                pointpos: -1.8,
                marker: {
                    color: 'rgb(7,40,89)'
                },
                boxpoints: 'all'
            };
            x = []
            for (var i = 0; i < whisk_CI.length; i++) {
                x.push(whisk_CI[i]);
            }
            var trace2 = {
                y: x,
                type: 'box',
                name: 'Open Whisk',
                jitter: 0.3,
                pointpos: -1.8,
                marker: {
                    color: 'rgb(7,40,50)'
                },
                boxpoints: 'all'
            };
            var CI_data = [trace1, trace2]
            var layout_CI = {
                title: 'Box Plot Response Time'
            };
            Plotly.newPlot(tab_content_CI, CI_data, layout_CI);
        });

    };

    function addChips(li) {
        // console.log(li)
        $('#target_chips').chips({
            autocompleteOptions: {
                data: li,
                limit: Infinity,
                minLength: 1
            }

        });
        $("#target_chips").trigger('updateData');
    }

    $('#target_chips').on('chip.select', function (e, chip) {
        console.log("Select", chip);
    });

});