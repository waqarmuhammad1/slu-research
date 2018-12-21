$(document).ready(function () {

    // document.getElementById('myDiv').style.display = "none";

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
        ajaxCallsFunc('POST', "http://127.0.0.1:5000/get_selected", 'application/json', null, function (branches) {

            var column_names = branches['column_names'];
            var sheet = branches['sheet_name'];
            var data = branches['data'];
            var head = "<thead>";
            var temp = "";

            var temp2 = "";
            for (var i = 0; i < column_names.length; i++) {

                temp = temp + " <th>" + column_names[i] + "</th> "


            }

            for (var x in data) {
                // console.log(x)
                var k = 0;
                var temp3 = ""
                for (var j in column_names) {

                    temp3 = temp3 + " <td> " + data[x][column_names[j]] + " </td> ";

                }

                temp2 = temp2 + " <tr> " + temp3 + " </tr> ";
            }

            var header = "<tr> " + temp + " </tr> "
            // var body = " <tbody> " + temp2 + " </tbody> "
            var body = temp2;
            try {
                $("#header").empty();
                $("#body").empty();
            }
            catch (error) {
                console.log(error)
            }

            var table = "<ul class=\"pagination pager\" id=\"myPager\"></ul>"
            removeElement('myPager')
            $("md").append(table)

            $("#header").append(header)
            $("#body").append(body)

            $("#md").append(table)

            $('#myTable').pageMe({
                pagerSelector: '#myPager',
                activeColor: 'blue',
                prevText: 'Anterior',
                nextText: 'Siguiente',
                showPrevNext: true,
                hidePageNumbers: false,
                perPage: 8
            });

            function removeElement(id) {
                var elem = document.getElementById(id);
                return elem.parentNode.removeChild(elem);
            }

        });

        ajaxCallsFunc('POST', "http://127.0.0.1:5000/get_ava_algos", 'application/json', null, function (branches) {

            for (var x in branches) {
                $("#algos").append($('<option value=\"' + branches[x] + '\"> ' + branches[x] + ' </option>'))
                $('select').formSelect();
            }

        });

    };
    // $("#select1").change(function () {

    //     details = JSON.stringify({
    //         "sheet_name": $(this).val()
    //     })
    //     console.log(details)
    //     ajaxCallsFunc('POST', "http://127.0.0.1:5000/get_columns", 'application/json', details, function (branches) {
    //         var ab = new Object();
    //         for (var x in branches) {
    //             ab[branches[x]] = null;
    //         }

    //         addChips(ab);
    //     });

    // })


    // function addChips(li) {
    //     console.log(li)
    //     $('#train_chips').chips({
    //         autocompleteOptions: {
    //             data: li,
    //             limit: Infinity,
    //             minLength: 1
    //         }
    //     });
    //     $("#train_chips").trigger('updateData');

    //     $('#target_chips').chips({
    //         autocompleteOptions: {
    //             data: li,
    //             limit: Infinity,
    //             minLength: 1
    //         }
    //     });
    //     $("#target_chips").trigger('updateData');
    // }
    // $('#target_chips').chips({
    //     autocompleteOptions: {
    //         data: { 'Linear Regression': null, 'Elastic Net Regression': null, 'Lasso Regression': null, 'Lars Regression': null, 'LassoLars Regression': null },
    //         limit: Infinity,
    //         minLength: 1
    //     }
    // });
    // $("#target_chips").trigger('updateData');


    $("#target").click(function () {

        var data = $("#algos").val(); //M.Chips.getInstance($('#target_chips')).chipsData;
        var resp_obj = [];
        console.log(data)
        for (var x in data) {
            resp_obj.push(data[x]);
        }
        console.log(resp_obj)

        if (resp_obj.length > 0) {
            resp_obj = JSON.stringify({

                'target': resp_obj
            });
            ajaxCallsFunc('POST', "http://127.0.0.1:5000/apply_algos", 'application/json', resp_obj, function (branches) {
                // $('#target').removeClass("waves-effect waves-light submit").addClass('disabled');
                console.log(branches);

                for (var x in branches) {
                    console.log(x);
                    console.log(branches[x]);
                }

                $("#next").removeClass("disabled")
            });
        }

        // window.location.replace('results.html');
    });

    $("#next").click(function () {


        window.location.replace('results.html');


    });

});