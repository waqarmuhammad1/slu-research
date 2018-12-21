$(document).ready(function () {

    $('#files').change(handleFile);
    document.getElementById('myDiv').style.display = "none";
    // $('select').formSelect();
    // document.addEventListener('DOMContentLoaded', function () {
    //     var elems = document.querySelectorAll('.chips');
    //     var instances = M.Chips.init(elems, options);
    //     var instance = M.FormSelect.getInstance(elem);
    //     console.log(instance.options())
    //     console.log('poka')
    // });



    function ajaxCallsFunc(type, url, contentType, data, callback) {
        $.ajax({
            type: type,
            url: url,
            contentType: contentType,
            data: data,
            success: callback
        });
    }


    function handleFile(e) {
        //Get the files from Upload control
        var files = e.target.files;
        var d = []
        var reader = new FileReader();
        var name = files[0].name;

        var file_extension = name.split('.').pop();

        var sheet_names = [];
        var excel_data = [];
        var txt_data = [];

        var details = null;

        if (file_extension == 'xlsx' || file_extension == 'xls') {
            console.log('Got Excel file')
            reader.onload = function (e) {
                var data = e.target.result;
                excel_data = [];
                var result;
                var workbook = XLSX.read(data, { type: 'binary' });

                var sheet_name_list = workbook.SheetNames;
                sheet_names.push(sheet_name_list)
                sheet_name_list.forEach(function (y) { /* iterate through sheets */
                    var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
                    if (roa.length > 0) {
                        result = roa;
                    }

                    // excel_data.push({ "data": result, "sheet_name": y })
                    // d.push(excel_data)
                    // console.log(d)
                    document.getElementById('myDiv').style.display = 'block';
                    $("#select1").append($("<option>" + y + "</option>"));
                    $("#select1").trigger('contentChanged');
                    excel_data.push({ [y]: result });
                });
                // document.getElementById('select1').value = sheet_names[0][0];
                details = JSON.stringify({

                    "file_name": name,
                    "data": excel_data,
                    "file_type": file_extension

                });
                ajaxCallsFunc('POST', "http://127.0.0.1:5000/upload", 'application/json', details, function (branches) {
                });


            };
            console.log("selected value" + document.getElementById('select1').value);



            console.log(excel_data)

            console.log(details)

            reader.readAsArrayBuffer(files[0]);
        }
        else if (file_extension == 'txt' || file_extension == 'csv') {

            console.log('Got Text/CSV file')
            var f = files[0];
            if (f) {
                var r = new FileReader();
                r.onload = function (e) {
                    var contents = e.target.result;
                    txt_data.push(contents);
                }

                details = JSON.stringify({

                    "file_name": name,
                    "data": txt_data,
                    "file_type": file_extension

                });
                r.readAsText(f);
            } else {
                alert("Failed to load file");
            }
        }

        var initialized = false;
        $("#select1").change(function () {

            details = JSON.stringify({
                "sheet_name": $(this).val()
            });

            ajaxCallsFunc('POST', "http://127.0.0.1:5000/get_data", 'application/json', details, function (branches) {

                var column_names = branches['column_names'];
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
        });


    }

    $("#select1").change(function () {

        details = JSON.stringify({
            "sheet_name": $(this).val()
        })
        console.log(details)
        ajaxCallsFunc('POST', "http://127.0.0.1:5000/get_columns", 'application/json', details, function (branches) {
            var ab = new Object();

            for (var x in branches) {
                ab[branches[x]] = null;
            }

            for (var x in branches) {
                $("#target_chips").append($('<option value=\"' + branches[x] + '\"> ' + branches[x] + ' </option>'))
                $("#train_chips").append($('<option value=\"' + branches[x] + '\"> ' + branches[x] + ' </option>'))
                $('select').formSelect();
            }

            // addChips(ab);
        });

    })


    function addChips(li) {
        console.log(li)
        $('#train_chips').chips({
            autocompleteOptions: {
                data: li,
                limit: Infinity,
                minLength: 1
            }
        });
        $("#train_chips").trigger('updateData');

        // $('#target_chips').chips({
        //     autocompleteOptions: {
        //         data: li,
        //         limit: Infinity,
        //         minLength: 1
        //     }
        // });
        // $("#target_chips").trigger('updateData');
    }

    $("#train").click(function () {

        var data = $('#train_chips').val();
        var resp_obj = []
        console.log(data)
        for (var x in data) {
            console.log(data[x]);
            resp_obj.push(data[x]);
        }
        console.log(resp_obj)

        var gotTrain = false;
        var gotTarget = false;

        if (resp_obj.length > 0) {
            resp_obj = JSON.stringify({

                'train': resp_obj
            });
            ajaxCallsFunc('POST', "http://127.0.0.1:5000/get_train", 'application/json', resp_obj, function (branches) {
                // $('#train').removeClass("waves-effect waves-light submit").addClass('disabled');
                // $("#next").removeClass("disabled")
            });
            gotTrain = true;
        }


        var data = $('#target_chips').val();
        var target_obj = []
        console.log(data)
        for (var x in data) {
            console.log(data[x]);
            target_obj.push(data[x]);
        }
        console.log(target_obj)


        if (target_obj.length > 0) {
            target_obj = JSON.stringify({

                'target': target_obj
            });
            ajaxCallsFunc('POST', "http://127.0.0.1:5000/get_target", 'application/json', target_obj, function (branches) {
                // $('#target').removeClass("waves-effect waves-light submit").addClass('disabled');
                // $("#next").removeClass("disabled")
                console.log(branches)
            });
            gotTarget = true;
        }

        if(gotTrain == true && gotTarget == true){
            $("#next").removeClass("disabled")
        }

    });

    // $("#target").click(function () {

    //     var data = M.Chips.getInstance($('#target_chips')).chipsData;
    //     var resp_obj = [];

    //     for (var x in data) {
    //         for (var y in data[x]) {
    //             resp_obj.push(data[x][y])

    //         }
    //     }
    //     console.log(resp_obj)

    //     if (resp_obj.length > 0) {
    //         resp_obj = JSON.stringify({

    //             'target': resp_obj
    //         });
    //         ajaxCallsFunc('POST', "http://127.0.0.1:5000/get_target", 'application/json', resp_obj, function (branches) {
    //             // $('#target').removeClass("waves-effect waves-light submit").addClass('disabled');
    //             $("#next").removeClass("disabled")
    //             console.log(branches)
    //         });
    //     }
    // });

    $("#next").click(function () {

        // console.log(window.location)
        window.location.replace('ml.html')
        // window.location = 'http://www.google.com'

    });


});